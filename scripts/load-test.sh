#!/bin/bash
# Load test — Apache friendly via curl + xargs (no Vercel edge challenge issues)
#
# Usage:
#   ./load-test.sh                    # default: http://localhost:3000/login, 20 conc, 200 total
#   ./load-test.sh <url>              # custom route
#   ./load-test.sh <url> <concurrency> <total>
#
# Examples:
#   ./load-test.sh http://localhost:3000/           # dashboard
#   ./load-test.sh http://localhost:3000/admin 50 500
set -euo pipefail

URL="${1:-http://localhost:3000/login}"
CONC="${2:-20}"
TOTAL="${3:-200}"

RES="$(mktemp)"

printf "" > "$RES"
seq 1 "$TOTAL" | xargs -P "$CONC" -I{} curl -s -o /dev/null -w "%{http_code} %{time_total}\n" -H "Accept: text/html" "$URL" >> "$RES"

OK=0; FAIL=0; TOT=0; MAX=0; declare -a T
while read code time; do
  if [ "$code" = "200" ]; then OK=$((OK+1)); else FAIL=$((FAIL+1)); fi
  TOT=$(echo "$TOT+$time" | bc); T+=("$time")
  MAX=$(echo "if($time>$MAX)$time else $MAX" | bc)
done < "$RES"

n=${#T[@]}
IFS=$'\n' S=($(printf "%s\n" "${T[@]}" | sort -n))
P50=${S[$((n/2))]}; P90=${S[$((n*9/10))]}; P95=${S[$((n*95/100))]}
AVG=$(echo "scale=3; $TOT / $n" | bc)
RPS=$(echo "scale=1; $OK / $TOT" | bc)

echo "══════════════════════════════════════════════"
echo " Carga: $CONC concorrentes x $TOTAL total"
echo " Rota:  $URL"
echo "──────────────────────────────────────────────"
echo " Sucessos:  $OK   Falhas: $FAIL"
echo " Throughput: ${RPS} req/s"
echo " Latência:"
echo "   avg ${AVG}s | p50 ${P50}s | p90 ${P90}s | p95 ${P95}s | max ${MAX}s"
echo "══════════════════════════════════════════════"
rm -f "$RES"
