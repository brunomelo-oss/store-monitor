/*
  Warnings:

  - Added the required column `updatedAt` to the `Build` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Publication` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Track` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Version` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "App" ADD COLUMN     "city" TEXT,
ADD COLUMN     "state" TEXT;

-- AlterTable: add updatedAt with default to backfill existing rows
ALTER TABLE "Build" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Publication" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Track" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Version" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "App_playStatus_idx" ON "App"("playStatus");

-- CreateIndex
CREATE INDEX "App_appStatus_idx" ON "App"("appStatus");

-- CreateIndex
CREATE INDEX "App_updatedAt_idx" ON "App"("updatedAt");

-- CreateIndex
CREATE INDEX "App_organizationId_playStatus_idx" ON "App"("organizationId", "playStatus");

-- CreateIndex
CREATE INDEX "App_organizationId_appStatus_idx" ON "App"("organizationId", "appStatus");

-- CreateIndex
CREATE INDEX "App_organizationId_updatedAt_idx" ON "App"("organizationId", "updatedAt");

-- CreateIndex
CREATE INDEX "App_city_idx" ON "App"("city");

-- CreateIndex
CREATE INDEX "App_state_idx" ON "App"("state");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_action_idx" ON "AuditLog"("organizationId", "action");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_createdAt_idx" ON "AuditLog"("organizationId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_action_createdAt_idx" ON "AuditLog"("organizationId", "action", "createdAt");

-- CreateIndex
CREATE INDEX "Build_status_idx" ON "Build"("status");

-- CreateIndex
CREATE INDEX "Build_createdAt_idx" ON "Build"("createdAt");

-- CreateIndex
CREATE INDEX "Release_submittedAt_idx" ON "Release"("submittedAt");

-- CreateIndex
CREATE INDEX "Release_publishedAt_idx" ON "Release"("publishedAt");

-- CreateIndex
CREATE INDEX "SyncHistory_organizationId_status_idx" ON "SyncHistory"("organizationId", "status");

-- CreateIndex
CREATE INDEX "SyncHistory_organizationId_startedAt_idx" ON "SyncHistory"("organizationId", "startedAt");

-- ──────────────────────────────────────
-- MATERIALIZED VIEW: Dashboard Stats
-- ──────────────────────────────────────
CREATE MATERIALIZED VIEW mv_dashboard_stats AS
SELECT
  o.id AS organization_id,
  COUNT(DISTINCT a.id) AS total_apps,
  COUNT(DISTINCT a.id) FILTER (WHERE a."playStatus" = 'PUBLISHED' OR a."appStatus" = 'PUBLISHED') AS published_apps,
  COUNT(DISTINCT a.id) FILTER (WHERE a."playStatus" = 'REVIEW' OR a."appStatus" = 'REVIEW') AS in_review_apps,
  COUNT(DISTINCT a.id) FILTER (WHERE a."playStatus" = 'REJECTED' OR a."appStatus" = 'REJECTED') AS rejected_apps,
  COUNT(DISTINCT a.id) FILTER (WHERE a."playStatus" IN ('PENDING','FAILED') OR a."appStatus" IN ('PENDING','FAILED')) AS needs_attention_apps,
  COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'PROCESSING') AS pending_builds,
  COUNT(DISTINCT a.id) FILTER (WHERE a."playVersion" IS NOT NULL AND a."playVersion" != '') AS google_play_apps,
  COUNT(DISTINCT a.id) FILTER (WHERE a."appVersion" IS NOT NULL AND a."appVersion" != '') AS apple_store_apps,
  ROUND(
    AVG(EXTRACT(EPOCH FROM (r."publishedAt" - r."submittedAt"))) FILTER (WHERE r."publishedAt" IS NOT NULL)
  )::integer AS avg_approval_seconds,
  MAX(a."updatedAt") AS last_activity_at
FROM "Organization" o
LEFT JOIN "App" a ON a."organizationId" = o.id
LEFT JOIN "Build" b ON b."appId" = a.id
LEFT JOIN "Release" r ON r."appId" = a.id
GROUP BY o.id;

CREATE UNIQUE INDEX mv_dashboard_stats_org_idx ON mv_dashboard_stats (organization_id);

-- ──────────────────────────────────────
-- FUNCTION: Refresh Dashboard Stats
-- ──────────────────────────────────────
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS trigger AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_stats;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ──────────────────────────────────────
-- TRIGGERS: Auto-refresh materialized view
-- ──────────────────────────────────────
DROP TRIGGER IF EXISTS trg_mv_dashboard_app ON "App";
CREATE TRIGGER trg_mv_dashboard_app
  AFTER INSERT OR UPDATE OR DELETE ON "App"
  FOR EACH STATEMENT EXECUTE FUNCTION refresh_dashboard_stats();

DROP TRIGGER IF EXISTS trg_mv_dashboard_build ON "Build";
CREATE TRIGGER trg_mv_dashboard_build
  AFTER INSERT OR UPDATE OR DELETE ON "Build"
  FOR EACH STATEMENT EXECUTE FUNCTION refresh_dashboard_stats();

DROP TRIGGER IF EXISTS trg_mv_dashboard_release ON "Release";
CREATE TRIGGER trg_mv_dashboard_release
  AFTER INSERT OR UPDATE OR DELETE ON "Release"
  FOR EACH STATEMENT EXECUTE FUNCTION refresh_dashboard_stats();

-- ──────────────────────────────────────
-- FUNCTION: Sync App flat fields from related data
-- ──────────────────────────────────────
CREATE OR REPLACE FUNCTION sync_app_flat_fields()
RETURNS trigger AS $$
DECLARE
  target_app_id integer;
BEGIN
  target_app_id := CASE
    WHEN TG_OP = 'DELETE' THEN OLD."appId"
    ELSE NEW."appId"
  END;

  UPDATE "App" a
  SET
    "playStatus" = COALESCE((
      SELECT v.status::text FROM "Version" v
      WHERE v."appId" = a.id AND v.store = 'GOOGLE'
      ORDER BY v."createdAt" DESC LIMIT 1
    ), a."playStatus"),
    "playVersion" = COALESCE((
      SELECT v.version FROM "Version" v
      WHERE v."appId" = a.id AND v.store = 'GOOGLE'
      ORDER BY v."createdAt" DESC LIMIT 1
    ), a."playVersion"),
    "appStatus" = COALESCE((
      SELECT v.status::text FROM "Version" v
      WHERE v."appId" = a.id AND v.store = 'APPLE'
      ORDER BY v."createdAt" DESC LIMIT 1
    ), a."appStatus"),
    "appVersion" = COALESCE((
      SELECT v.version FROM "Version" v
      WHERE v."appId" = a.id AND v.store = 'APPLE'
      ORDER BY v."createdAt" DESC LIMIT 1
    ), a."appVersion"),
    "installations" = COALESCE((
      SELECT SUM(downloads + installs) FROM "Analytics" an
      WHERE an."appId" = a.id
    ), a."installations"),
    "rating" = COALESCE((
      SELECT AVG(score)::double precision FROM "Rating" r
      WHERE r."appId" = a.id
    ), a."rating")
  WHERE a.id = target_app_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger: sync flat fields when Version changes
DROP TRIGGER IF EXISTS trg_sync_app_flat_fields_version ON "Version";
CREATE TRIGGER trg_sync_app_flat_fields_version
  AFTER INSERT OR UPDATE OR DELETE ON "Version"
  FOR EACH ROW EXECUTE FUNCTION sync_app_flat_fields();

-- Trigger: sync flat fields when Analytics changes
DROP TRIGGER IF EXISTS trg_sync_app_flat_fields_analytics ON "Analytics";
CREATE TRIGGER trg_sync_app_flat_fields_analytics
  AFTER INSERT OR UPDATE OR DELETE ON "Analytics"
  FOR EACH ROW EXECUTE FUNCTION sync_app_flat_fields();

-- Trigger: sync flat fields when Rating changes
DROP TRIGGER IF EXISTS trg_sync_app_flat_fields_rating ON "Rating";
CREATE TRIGGER trg_sync_app_flat_fields_rating
  AFTER INSERT OR UPDATE OR DELETE ON "Rating"
  FOR EACH ROW EXECUTE FUNCTION sync_app_flat_fields();
