# CS272 S26 AI API Documentation

## AI Completions

Used to generate a response using GPT-4o Mini. **You are responsible for all traffic coming from your `Authorization` code.**

### Request 

`POST` `https://cs272.cs.wisc.edu/rest/s26/hw10/ai`

You must request an AI completion with a list of message objects, each containing a valid `role` ("developer", "assistant", or "user") and corresponding `content` as well as a valid set of headers specified below.


#### Request Body
```json
[
    {
        "role": "assistant",
        "content": "Welcome to BadgerChatGPT! Ask me anything."
    },
    {
        "role": "user",
        "content": "hey how are you"
    }
]
```

#### Request Headers
```json
{
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_AUTH_TOKEN"
}
```

### Response


If the request is successful, a `200` will be sent containing a `msg` with the AI's response...
```json
{
    "msg": "I'm just a program, but I'm here and ready to help! How about you? What’s on your mind?"
}
```

If your list of objects is malformed, the following `400` will be sent...

```json
{
    "msg": "The request body does not contain a valid list of chat objects."
}
```

If you fail to include a valid `Authorization` header, the following `401` will be sent...

```json
{
    "msg": "Your request must include an Authorization header beginning with Bearer!"
}
```

If your request is too long, the following `413` will be sent...

```json
{
    "msg": "The request body is too long for the given context window."
}
```

If you make too many requests in a short period of time, the following `429` will be sent...

```json
{
    "msg": "Too many requests, please try again later."
}
```
