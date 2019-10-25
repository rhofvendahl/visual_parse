CELERY=`ps -A -o pid,rss,command | grep celeryd | grep -v grep | awk '{total+=$2}END{printf("%d", total/1024)}'`
GUNICORN=`ps -A -o pid,rss,command | grep gunicorn | grep -v grep | awk '{total+=$2}END{printf("%d", total/1024)}'`
REDIS=`ps -A -o pid,rss,command | grep redis | grep -v grep | awk '{total+=$2}END{printf("%d", total)}'`
NGINX=`ps -A -o pid,rss,command | grep nginx | grep -v grep | awk '{total+=$2}END{printf("%d", total/1024)}'`
OTHER=`ps -A -o pid,rss,command | grep -v nginx | grep -v celeryd | grep -v gunicorn | grep -v redis | grep -v grep | awk '{total+=$2}END{printf("%d", total/1024)}'`
websites=`ps -A -o user,pid,rss,command | grep gunicorn | egrep -o "[a-z_]+\.py$" | sort | uniq | perl -wpe 's|\.py$||;' | xargs`
printf "%-10s %3s MB\n" "Celery:" $CELERY
printf "%-10s %3s MB\n" "Gunicorn:" $GUNICORN
printf "%-10s %3s MB\n" "Nginx:" $NGINX
printf "%-10s %3s KB\n" "Redis:" $REDIS
printf "%-10s %3s MB\n" "Other:" $OTHER
echo
free -m
echo

echo "Gunicorn memory usage by webste:"
TEST="Testing..."
for i in $websites
do
    mem_total=`ps -A -o pid,rss,command | grep gunicorn | grep -v grep | grep $i | awk '{total+=$2}END{printf("%d", total/1024)}';`
    printf "%-35s %3s MB\n" $i $mem_total
done


# Example output:
#
# Celery: 37 MB
# Gunicorn: 529 MB
# Nginx: 7 MB
# Redis: 680 KB
# Other: 20 MB

#              total       used       free     shared    buffers     cached
# Mem:           993        782        210          0         23         23
# -/+ buffers/cache:        736        257
# Swap:         2047        990       1057
#
# my.example.com                       26 MB
# foo.example.com                      23 MB
# bar.example.com                      14 MB
# host.example.com                     25 MB
# ...
