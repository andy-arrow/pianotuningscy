#!/usr/bin/env bash
# Exhaustive live check for pianotuningscy.com.
#
# Every scheme/host combination, trailing-slash form, legacy Wix URL, Greek
# route and system file — verifying each either serves 200 or 301s to the one
# canonical address, and that nothing contradicts itself.
#
# Usage: bash scripts/check-live.sh

CANON="https://pianotuningscy.com"
pass=0; fail=0
ok()   { printf "  \033[32mPASS\033[0m  %-52s %s\n" "$1" "$2"; pass=$((pass+1)); }
bad()  { printf "  \033[31mFAIL\033[0m  %-52s %s\n" "$1" "$2"; fail=$((fail+1)); }

hdr() { printf "\n\033[1m%s\033[0m\n" "$1"; }

# final status after following redirects, plus the final URL
final() { curl -sL -o /dev/null -w '%{http_code} %{url_effective}' --max-time 25 "$1" 2>/dev/null; }

hdr "1. Host and scheme variants — all must reach the site"
for u in \
  "http://pianotuningscy.com" \
  "https://pianotuningscy.com" \
  "http://www.pianotuningscy.com" \
  "https://www.pianotuningscy.com" \
  "http://pianotuningscy.com/" \
  "https://www.pianotuningscy.com/"
do
  r=$(final "$u"); code=${r%% *}; dest=${r#* }
  if [ "$code" = "200" ]; then ok "$u" "→ $dest"; else bad "$u" "got $code"; fi
done

hdr "2. Canonical consistency — one address, no contradictions"
canon=$(curl -sL --max-time 25 "$CANON/" | grep -o '<link rel="canonical" href="[^"]*"' | head -1 | sed 's/.*href="//;s/"//')
[ "$canon" = "$CANON/" ] && ok "canonical tag" "$canon" || bad "canonical tag" "$canon (want $CANON/)"
wwwdest=$(curl -s -o /dev/null -w '%{redirect_url}' --max-time 25 "https://www.pianotuningscy.com/")
case "$wwwdest" in "$CANON/"*) ok "www 301s to canonical" "$wwwdest";; *) bad "www redirect" "$wwwdest";; esac
httpdest=$(curl -s -o /dev/null -w '%{redirect_url}' --max-time 25 "http://pianotuningscy.com/")
case "$httpdest" in https://*) ok "http upgrades to https" "$httpdest";; *) bad "http upgrade" "$httpdest";; esac

hdr "3. Core pages, both languages"
for p in / /services/ /about/ /reviews/ /faq/ /contact/ /book/ /areas/ /privacy/ /terms/ /cookies/ \
         /el/ /el/ypiresies/ /el/schetika-me-emas/ /el/kritikes/ /el/syhnes-erotiseis/ \
         /el/epikoinonia/ /el/klisi-rantevou/ /el/perioches/
do
  c=$(curl -s -o /dev/null -w '%{http_code}' --max-time 25 "$CANON$p")
  [ "$c" = "200" ] && ok "$p" "200" || bad "$p" "$c"
done

hdr "4. Every service page, both languages"
for p in piano-tuning piano-repairs piano-restoration piano-moving grand-piano-rental \
         piano-evaluation piano-guardian piano-covers
do
  c=$(curl -s -o /dev/null -w '%{http_code}' --max-time 25 "$CANON/services/$p/")
  [ "$c" = "200" ] && ok "/services/$p/" "200" || bad "/services/$p/" "$c"
done
for p in kourdisma-pianou episkeves-pianou anakainisi-pianou metafora-pianou \
         enoikiasi-pianou-me-oura ektimisi-pianou piano-guardian kalymmata-pianou
do
  c=$(curl -s -o /dev/null -w '%{http_code}' --max-time 25 "$CANON/el/ypiresies/$p/")
  [ "$c" = "200" ] && ok "/el/ypiresies/$p/" "200" || bad "/el/ypiresies/$p/" "$c"
done

hdr "5. Service-area pages, both languages"
for p in nicosia limassol larnaca paphos famagusta; do
  c=$(curl -s -o /dev/null -w '%{http_code}' --max-time 25 "$CANON/areas/$p/")
  [ "$c" = "200" ] && ok "/areas/$p/" "200" || bad "/areas/$p/" "$c"
done
for p in lefkosia lemesos larnaka pafos ammochostos; do
  c=$(curl -s -o /dev/null -w '%{http_code}' --max-time 25 "$CANON/el/perioches/$p/")
  [ "$c" = "200" ] && ok "/el/perioches/$p/" "200" || bad "/el/perioches/$p/" "$c"
done

hdr "6. Legacy Wix URLs — must 301, on BOTH hosts"
legacy_check() {
  local host="$1" path="$2" want="$3"
  local code dest
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 25 "$host$path")
  dest=$(curl -sL -o /dev/null -w '%{url_effective}' --max-time 25 "$host$path")
  if [ "$code" = "301" ] && [ "$dest" = "$CANON$want" ]; then
    ok "$host$path" "301 → $want"
  else
    bad "$host$path" "code=$code dest=$dest (want $want)"
  fi
}
for host in "$CANON" "https://www.pianotuningscy.com"; do
  legacy_check "$host" "/blank-1" "/services/"
  legacy_check "$host" "/blank-2" "/about/"
  legacy_check "$host" "/blank-3" "/reviews/"
  legacy_check "$host" "/blank-4" "/contact/"
  legacy_check "$host" "/book-online" "/book/"
done
legacy_check "$CANON" "/service-page/piano-tuning" "/services/piano-tuning/"
legacy_check "$CANON" "/service-page/premium-grand-piano-rental" "/services/grand-piano-rental/"
legacy_check "$CANON" "/service-page/the-piano-guardian" "/services/piano-guardian/"
legacy_check "$CANON" "/pricing-plans/plans-pricing" "/services/piano-guardian/"
legacy_check "$CANON" "/paywall" "/"
legacy_check "$CANON" "/el/blank-1" "/el/ypiresies/"
legacy_check "$CANON" "/el/blank-4" "/el/epikoinonia/"
legacy_check "$CANON" "/el/service-page/piano-tuning" "/el/ypiresies/kourdisma-pianou/"

hdr "7. System files"
for f in /robots.txt /sitemap-index.xml /sitemap-0.xml /favicon.ico /favicon.svg \
         /apple-touch-icon.png /site.webmanifest /og/og-default.jpg /og/og-el.jpg
do
  c=$(curl -s -o /dev/null -w '%{http_code}' --max-time 25 "$CANON$f")
  [ "$c" = "200" ] && ok "$f" "200" || bad "$f" "$c"
done

hdr "8. A missing page must 404, not 200"
c=$(curl -s -o /dev/null -w '%{http_code}' --max-time 25 "$CANON/this-page-does-not-exist/")
[ "$c" = "404" ] && ok "/this-page-does-not-exist/" "404" || bad "/this-page-does-not-exist/" "$c"

hdr "9. Security headers"
H=$(curl -sI --max-time 25 "$CANON/")
for h in content-security-policy x-frame-options x-content-type-options referrer-policy permissions-policy strict-transport-security; do
  echo "$H" | grep -qi "^$h:" && ok "$h" "present" || bad "$h" "MISSING"
done

hdr "10. No Netlify branding leaking into pages"
n=$(curl -sL --max-time 25 "$CANON/" | grep -ci "netlify")
[ "$n" = "0" ] && ok "no netlify references" "0" || bad "netlify references" "$n found"

hdr "11. Certificate covers both hosts"
for h in pianotuningscy.com www.pianotuningscy.com; do
  s=$(echo | openssl s_client -servername "$h" -connect "$h:443" 2>/dev/null | openssl x509 -noout -checkhost "$h" 2>/dev/null)
  case "$s" in *"does match"*) ok "cert valid for $h" "ok";; *) bad "cert for $h" "$s";; esac
done

hdr "12. Chat assistant"
CHAT="https://pianotuningscy-chat.aroditis-andreas.workers.dev"
k=$(curl -s --max-time 25 "$CANON/chat-knowledge.json")
echo "$k" | python3 -c 'import json,sys; d=json.load(sys.stdin); assert "€100" in d["knowledge"] and "piano-tuning" in d["serviceSlugs"]' 2>/dev/null \
  && ok "/chat-knowledge.json" "valid, has prices" || bad "/chat-knowledge.json" "missing or malformed"
echo "$H" | grep -i "^content-security-policy:" | grep -q "$CHAT" \
  && ok "CSP allows the chat Worker" "connect-src" || bad "CSP" "chat Worker not in connect-src"
for p in / /el/; do
  curl -s --max-time 25 "$CANON$p" | grep -q "ptc-chat-config" \
    && ok "widget on $p" "present" || bad "widget on $p" "missing"
done
h=$(curl -s --max-time 25 "$CHAT/health")
case "$h" in *'"ok":true'*) ok "Worker /health" "knowledge reachable";; *) bad "Worker /health" "$h";; esac
c=$(curl -s -o /dev/null -w '%{http_code}' --max-time 25 -X POST -H "Origin: https://evil.example" --data '{}' "$CHAT/")
[ "$c" = "403" ] && ok "Worker refuses other sites" "403" || bad "Worker foreign origin" "$c"
c=$(curl -s -o /dev/null -w '%{http_code}' --max-time 25 -X POST -H "Origin: $CANON" --data 'not json' "$CHAT/")
[ "$c" = "400" ] && ok "Worker rejects bad input" "400" || bad "Worker bad input" "$c"
# One real question end to end (~40 of the 10,000 free daily Neurons). NO_AI=1 skips it.
if [ "${NO_AI:-0}" != "1" ]; then
  r=$(curl -sN --max-time 60 -w '\n%{http_code}' -X POST -H "Origin: $CANON" -H 'Content-Type: text/plain;charset=UTF-8' \
      --data '{"messages":[{"role":"user","content":"How much is a standard piano tuning?"}],"locale":"en","page":"/"}' "$CHAT/")
  code=${r##*$'\n'}; body=${r%$'\n'*}
  txt=$(printf '%s' "$body" | python3 -c 'import json,sys
raw=sys.stdin.read(); out=""
for ev in raw.split("\n\n"):
    if ev.startswith("data: "):
        d=json.loads(ev[6:]); out+=d.get("t","")
        if "error" in d: out+="[ERROR:"+d["error"]+"]"
        if d.get("done"): out+="[END]"
if not out:
    try: out="[ERROR:"+json.loads(raw).get("error","?")+"]"
    except Exception: pass
print(out)' 2>/dev/null)
  case "$txt" in *"[ERROR:quota]"*) ok "AI answers" "paused: daily free allowance used (expected fail-closed)";;
                 *"[ERROR:daily]"*|*"[ERROR:rate]"*) ok "AI answers" "skipped: this IP has hit its own chat limit";;
                 *"[ERROR:"*) bad "AI answers" "HTTP $code ${txt:0:160}";;
                 *"100"*"[END]") ok "AI answers" "streams a complete reply quoting €100";;
                 *) bad "AI answers" "HTTP $code ${txt:0:160}";; esac
fi

printf "\n\033[1m%d passed, %d failed\033[0m\n" "$pass" "$fail"
exit $([ "$fail" -eq 0 ] && echo 0 || echo 1)
