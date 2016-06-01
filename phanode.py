import requests
import json

_api_base_url = 'http://localhost:9999' # base api
_url = 'http://angular.io/'
_useragent = 'PhatomBOT/1.1'
_delay = 10000 # time in ms
_viewport = '1920x900'


dims =_viewport.split('x')
width = dims[0]
height = dims[1]

cookieJar = [{"name": "cookie-1", "value": "value-1", "domain": ".angular.io", "path": "/", "httponly": False, "secure": False}]

headers =   {
                'Content-Type': 'application/json',
            }

payload =   {
                'url': _url,
                'useragent': _useragent,
                'width': width,
                'height': height,
                'delay': _delay,
                'cookies': cookieJar
            }

req = requests.post(_api_base_url, data=json.dumps(payload), headers=headers)

response = json.loads(req.content)

print "Status: %s" % response["status"]

# print "Request Response Pairs: %s" % response["reqres"]
with open('output/reqrep.txt', 'w') as reqrep:
	json.dump(response["reqres"], reqrep)

# print "JPG Image: %s" % response["jpg"]
with open('output/screnshot.jpg', 'wb') as jpegfile:
	jpegfile.write(response["jpg"].decode("base64"))

# print "HTML Content: %s" % response["html"]
with open('output/index.html', 'w') as htmlfile:
	htmlfile.write(response["html"].encode("utf-8"))
