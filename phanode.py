import requests
import json

_api_base_url = 'http://localhost:9999' # base api
_url = 'http://example.com/'
_useragent = 'MyCustomUA/1.1'
_delay = 10000 # time in ms
_viewport = '1024x768'


dims =_viewport.split('x')
height = dims[0]
width = dims[1]

cookieJar = [
				{	"domain": ".example.com", 
					"is_http_only": False, 
					"name": "cookie1", 
					"expires": 1779767960, 
					"value": "value1", 
					"is_secure": False, 
					"path": "/"
				},
				{	"domain": ".example.com", 
					"is_http_only": False, 
					"name": "cookie2", 
					"expires": 1779767960, 
					"value": "value2", 
					"is_secure": False, 
					"path": "/"
				}
			]

headers =   {
                'Content-Type': 'application/json',
            }

payload =   {
                'url': _url,
                'useragent': _useragent,
                'width': width,
                'height': height,
                'delay': _delay,
                'cookie': cookieJar
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