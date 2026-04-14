build
```bash
docker build . -t ctnelson1997/cs272-s26-api
docker push ctnelson1997/cs272-s26-api
```

run
```bash
docker pull ctnelson1997/cs272-s26-api
docker run --name=cs272_s26_ice_api -d --restart=always -p 23706:23706 -e CS272_CODES=AAAA... ctnelson1997/cs272-s26-api
```