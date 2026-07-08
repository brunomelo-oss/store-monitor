-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'ADMIN', 'MANAGER', 'VIEWER');

-- CreateEnum
CREATE TYPE "StoreType" AS ENUM ('GOOGLE', 'APPLE');

-- CreateEnum
CREATE TYPE "Region" AS ENUM ('BRASIL', 'INTERNACIONAL');

-- CreateEnum
CREATE TYPE "VersionStatus" AS ENUM ('DRAFT', 'REVIEW', 'PUBLISHED', 'REJECTED', 'UNPUBLISHED');

-- CreateEnum
CREATE TYPE "BuildStatus" AS ENUM ('PROCESSING', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PublicationStatus" AS ENUM ('SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "SyncType" AS ENUM ('APP_INFO', 'VERSIONS', 'BUILDS', 'REVIEWS', 'RATINGS', 'ANALYTICS', 'PUBLICATIONS');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'PARTIAL');

-- CreateEnum
CREATE TYPE "SyncTriggerType" AS ENUM ('MANUAL', 'SCHEDULED', 'WEBHOOK', 'RETRY');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('NEW_VERSION', 'BUILD_APPROVED', 'BUILD_REJECTED', 'REVIEW_STARTED', 'REVIEW_COMPLETED', 'REJECTION', 'APP_REMOVED', 'RATING_CHANGED', 'SYNC_FAILURE', 'INFO');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('SYNC', 'NOTIFICATION', 'ANALYTICS_UPDATE', 'RETRY');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'IGNORED');

-- CreateTable
CREATE TABLE "Organization" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'VIEWER',
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invite" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'VIEWER',
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "Invite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreConnection" (
    "id" SERIAL NOT NULL,
    "store" "StoreType" NOT NULL,
    "label" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSyncAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" INTEGER NOT NULL,

    CONSTRAINT "StoreConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConnectionConfig" (
    "id" SERIAL NOT NULL,
    "encryptedData" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "keyVersion" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "storeConnectionId" INTEGER NOT NULL,

    CONSTRAINT "ConnectionConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "App" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "region" "Region" NOT NULL DEFAULT 'BRASIL',
    "icon" TEXT,
    "packageName" TEXT,
    "bundleId" TEXT,
    "googleAccount" TEXT NOT NULL DEFAULT '',
    "appleAccount" TEXT NOT NULL DEFAULT '',
    "playStatus" TEXT NOT NULL DEFAULT 'unpublished',
    "playVersion" TEXT NOT NULL DEFAULT '',
    "playLastUpdate" TEXT NOT NULL DEFAULT '',
    "appStatus" TEXT NOT NULL DEFAULT 'unpublished',
    "appVersion" TEXT NOT NULL DEFAULT '',
    "appLastUpdate" TEXT NOT NULL DEFAULT '',
    "installations" INTEGER NOT NULL DEFAULT 0,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "storeConnectionId" INTEGER,

    CONSTRAINT "App_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Version" (
    "id" SERIAL NOT NULL,
    "appId" INTEGER NOT NULL,
    "store" "StoreType" NOT NULL,
    "version" TEXT NOT NULL,
    "buildNumber" TEXT,
    "status" "VersionStatus" NOT NULL DEFAULT 'DRAFT',
    "releaseNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Build" (
    "id" SERIAL NOT NULL,
    "appId" INTEGER NOT NULL,
    "store" "StoreType" NOT NULL,
    "buildNumber" TEXT NOT NULL,
    "versionId" INTEGER,
    "status" "BuildStatus" NOT NULL DEFAULT 'PROCESSING',
    "artifactUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Build_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Track" (
    "id" SERIAL NOT NULL,
    "appId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "versionId" INTEGER,
    "fraction" DOUBLE PRECISION,

    CONSTRAINT "Track_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Release" (
    "id" SERIAL NOT NULL,
    "store" "StoreType" NOT NULL,
    "status" "PublicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appId" INTEGER NOT NULL,
    "versionId" INTEGER,
    "buildId" INTEGER,
    "trackId" INTEGER,

    CONSTRAINT "Release_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Publication" (
    "id" SERIAL NOT NULL,
    "appId" INTEGER NOT NULL,
    "store" "StoreType" NOT NULL,
    "versionId" INTEGER,
    "status" "PublicationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Publication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analytics" (
    "id" SERIAL NOT NULL,
    "appId" INTEGER NOT NULL,
    "store" "StoreType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "installs" INTEGER NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "pageViews" INTEGER NOT NULL DEFAULT 0,
    "crashes" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" SERIAL NOT NULL,
    "appId" INTEGER NOT NULL,
    "store" "StoreType" NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" SERIAL NOT NULL,
    "appId" INTEGER NOT NULL,
    "store" "StoreType" NOT NULL,
    "reviewId" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "reply" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rejection" (
    "id" SERIAL NOT NULL,
    "appId" INTEGER NOT NULL,
    "store" "StoreType" NOT NULL,
    "versionId" INTEGER,
    "reason" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rejection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyncHistory" (
    "id" SERIAL NOT NULL,
    "type" "SyncType" NOT NULL,
    "status" "SyncStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "details" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "organizationId" INTEGER NOT NULL,
    "appId" INTEGER,
    "store" "StoreType",
    "triggerType" "SyncTriggerType" NOT NULL DEFAULT 'MANUAL',
    "executionId" TEXT,
    "changesDetected" INTEGER NOT NULL DEFAULT 0,
    "warnings" JSONB,

    CONSTRAINT "SyncHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" INTEGER NOT NULL,
    "userId" INTEGER,
    "appId" INTEGER,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" INTEGER,
    "metadata" JSONB,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" INTEGER NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" SERIAL NOT NULL,
    "type" "JobType" NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "payload" JSONB,
    "result" JSONB,
    "scheduledAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" INTEGER NOT NULL,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "lastError" TEXT,
    "stack" TEXT,
    "duration" INTEGER,
    "lastRetryAt" TIMESTAMP(3),
    "triggerType" "SyncTriggerType" NOT NULL DEFAULT 'MANUAL',

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "Organization_slug_idx" ON "Organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_token_idx" ON "Session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Invite_token_key" ON "Invite"("token");

-- CreateIndex
CREATE INDEX "Invite_organizationId_idx" ON "Invite"("organizationId");

-- CreateIndex
CREATE INDEX "Invite_token_idx" ON "Invite"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Invite_organizationId_email_key" ON "Invite"("organizationId", "email");

-- CreateIndex
CREATE INDEX "StoreConnection_organizationId_store_isActive_idx" ON "StoreConnection"("organizationId", "store", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "StoreConnection_organizationId_store_label_key" ON "StoreConnection"("organizationId", "store", "label");

-- CreateIndex
CREATE UNIQUE INDEX "ConnectionConfig_storeConnectionId_key" ON "ConnectionConfig"("storeConnectionId");

-- CreateIndex
CREATE INDEX "App_organizationId_region_pinned_sortOrder_idx" ON "App"("organizationId", "region", "pinned", "sortOrder");

-- CreateIndex
CREATE INDEX "App_organizationId_idx" ON "App"("organizationId");

-- CreateIndex
CREATE INDEX "App_storeConnectionId_idx" ON "App"("storeConnectionId");

-- CreateIndex
CREATE INDEX "App_packageName_idx" ON "App"("packageName");

-- CreateIndex
CREATE INDEX "App_bundleId_idx" ON "App"("bundleId");

-- CreateIndex
CREATE INDEX "Version_appId_store_idx" ON "Version"("appId", "store");

-- CreateIndex
CREATE INDEX "Version_appId_store_status_idx" ON "Version"("appId", "store", "status");

-- CreateIndex
CREATE INDEX "Version_appId_createdAt_idx" ON "Version"("appId", "createdAt");

-- CreateIndex
CREATE INDEX "Build_appId_store_idx" ON "Build"("appId", "store");

-- CreateIndex
CREATE INDEX "Build_appId_store_status_idx" ON "Build"("appId", "store", "status");

-- CreateIndex
CREATE INDEX "Build_versionId_idx" ON "Build"("versionId");

-- CreateIndex
CREATE INDEX "Track_versionId_idx" ON "Track"("versionId");

-- CreateIndex
CREATE UNIQUE INDEX "Track_appId_name_key" ON "Track"("appId", "name");

-- CreateIndex
CREATE INDEX "Release_appId_store_idx" ON "Release"("appId", "store");

-- CreateIndex
CREATE INDEX "Release_appId_store_status_idx" ON "Release"("appId", "store", "status");

-- CreateIndex
CREATE INDEX "Release_appId_createdAt_idx" ON "Release"("appId", "createdAt");

-- CreateIndex
CREATE INDEX "Release_versionId_idx" ON "Release"("versionId");

-- CreateIndex
CREATE INDEX "Release_buildId_idx" ON "Release"("buildId");

-- CreateIndex
CREATE INDEX "Release_trackId_idx" ON "Release"("trackId");

-- CreateIndex
CREATE INDEX "Publication_appId_store_idx" ON "Publication"("appId", "store");

-- CreateIndex
CREATE INDEX "Publication_appId_store_status_idx" ON "Publication"("appId", "store", "status");

-- CreateIndex
CREATE INDEX "Publication_appId_createdAt_idx" ON "Publication"("appId", "createdAt");

-- CreateIndex
CREATE INDEX "Analytics_appId_date_idx" ON "Analytics"("appId", "date");

-- CreateIndex
CREATE INDEX "Analytics_appId_store_date_idx" ON "Analytics"("appId", "store", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Analytics_appId_store_date_key" ON "Analytics"("appId", "store", "date");

-- CreateIndex
CREATE INDEX "Rating_appId_store_date_idx" ON "Rating"("appId", "store", "date");

-- CreateIndex
CREATE INDEX "Rating_appId_store_score_idx" ON "Rating"("appId", "store", "score");

-- CreateIndex
CREATE UNIQUE INDEX "Review_reviewId_key" ON "Review"("reviewId");

-- CreateIndex
CREATE INDEX "Review_appId_store_idx" ON "Review"("appId", "store");

-- CreateIndex
CREATE INDEX "Review_appId_store_createdAt_idx" ON "Review"("appId", "store", "createdAt");

-- CreateIndex
CREATE INDEX "Rejection_appId_store_idx" ON "Rejection"("appId", "store");

-- CreateIndex
CREATE INDEX "Rejection_appId_createdAt_idx" ON "Rejection"("appId", "createdAt");

-- CreateIndex
CREATE INDEX "SyncHistory_organizationId_idx" ON "SyncHistory"("organizationId");

-- CreateIndex
CREATE INDEX "SyncHistory_appId_store_type_idx" ON "SyncHistory"("appId", "store", "type");

-- CreateIndex
CREATE INDEX "SyncHistory_status_idx" ON "SyncHistory"("status");

-- CreateIndex
CREATE INDEX "SyncHistory_startedAt_idx" ON "SyncHistory"("startedAt");

-- CreateIndex
CREATE INDEX "SyncHistory_executionId_idx" ON "SyncHistory"("executionId");

-- CreateIndex
CREATE INDEX "Notification_organizationId_idx" ON "Notification"("organizationId");

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_appId_idx" ON "Notification"("appId");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_idx" ON "AuditLog"("organizationId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "Job_organizationId_idx" ON "Job"("organizationId");

-- CreateIndex
CREATE INDEX "Job_organizationId_status_type_idx" ON "Job"("organizationId", "status", "type");

-- CreateIndex
CREATE INDEX "Job_status_idx" ON "Job"("status");

-- CreateIndex
CREATE INDEX "Job_scheduledAt_idx" ON "Job"("scheduledAt");
