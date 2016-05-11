import requests
import json

_api_base_url = 'http://localhost:9999' # base api
_url = 'http://niteshrijal.com.np/'
_useragent = 'SmarshBot/1.1'
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
                'height': height
            }

req = requests.post(_api_base_url, data=json.dumps(payload), headers=headers)

response = json.loads(req.content)

print "Status: %s" % response["status"]

print "Request Objects: %s" % response["request"]

print "Response Objects: %s" % response["response"]

print "HTML Content: %s" % response["html"]