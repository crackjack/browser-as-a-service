import requests
import json

_api_base_url = 'http://localhost:9999' # base api
_url = 'https://angular.io/'
_useragent = 'SmarshBot/1.1'
_delay = 10000 # time in ms
_viewport = '1024x768'


dims =_viewport.split('x')
height = dims[0]
width = dims[1]

headers =   {
                'Content-Type': 'application/json',
            }

payload =   {
                'url': _url,
                'useragent': _useragent,
                'width': width,
                'height': height,
                'delay': _delay
            }

req = requests.post(_api_base_url, data=json.dumps(payload), headers=headers)

response = json.loads(req.content)

print "Status: %s" % response["status"]

# print "Request Objects: %s" % response["request"]
# with open('output/request.txt', 'w') as reqfile:
#     json.dump(response["request"], reqfile)

# print "Response Objects: %s" % response["response"]
# with open('output/response.txt', 'w') as resfile:
#     json.dump(response["response"], resfile)

# print "JPG Image: %s" % response["jpg"]
# with open('output/screnshot.jpg', 'wb') as jpegfile:
# 	jpegfile.write(response["jpg"].decode("base64"))

# print "HTML Content: %s" % response["html"]
# with open('output/index.html', 'w') as htmlfile:
# 	htmlfile.write(response["html"].encode("utf-8"))