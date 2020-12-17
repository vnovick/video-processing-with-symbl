Symbl is built on **Contextual Conversation Intelligence (C2I)** technology and provide a suite of APIs that enable you to incorporate human-level understanding that goes beyond simple natural language processing of voice and text conversations. You can get real-time analysis of free-flowing discussions like meetings, sales calls, support conversations, emails, chats, social conversations etc to automatically surface highly relevant summary topics, contextual insights, suggestive action items, follow-ups, decisions and questions - without the use of upfront training data, wake words or custom classifiers. 

There is a lot of functionality that Symbl can provide, but let's start this blog post series by creating something simple. Let's first start by generating transcripts for any video of your choosing. 

For this tutorial, I will pick up [NextJS](https://nextjs.org/) for the main stack and we will be using Symbl REST API to send video for processing and explore how we can get interactive transcripts from it. So let's get rolling.

If you are not familiar with [NextJS](https://nextjs.org/), it's the React Framework by [Vercel](https://vercel.com/), that has everything that you need to build production apps fast, reliable. Yo won't need to deal much with configuration and will get lots of optimizations and best practices in place out of the box. 


## Getting Started

#### 1. Create basic NextJS app

So first of all to get started, let's install basic NextJS app. 

> Note that we need to make sure that we have Node.js of version of 10.13 or later.

Run the following command in terminal to get started:

```bash
npx create-next-app video-processing-app
```

That will bootstrap the basic NextJS app for us. We can now navigate to `video-processing-app` directory and start our app by running 

```bash
yarn dev
# or
npm run dev
```

Now you can open http://localhost:3000 and see our basic NextJS app in place.



![NextJS app](https://dev-to-uploads.s3.amazonaws.com/i/ydsamsmuwtrskxaoah5p.png)



#### 2. Adding some styles with Chakra UI 

We would need to present some basic styling on the page, so for this demo, I decided to go with [Chakra UI](https://chakra-ui.com/) as a component library for React. It is built on top of popular [Emotion](https://emotion.sh/) and [Theme UI](https://theme-ui.com/getting-started) libraries and provide predefined accessible components that are using best practices and easy to customize.

To add Chakra UI to our NextJS app we can install all the dependencies first:

```bash
yarn add @chakra-ui/react @emotion/react @emotion/styled framer-motion
# or 
npm i @chakra-ui/react @emotion/react @emotion/styled framer-motion
```

After installing dependencies, we should wrap our app with `ChakraProvider` from Chakra. We can easily customize the default theme supplied by Chakra by using `extendTheme` function.

In order to wrap the whole app, we need to do that inside a dedicated page `pages/_app.js` 



```javascript
import {ChakraProvider, extendTheme} from '@chakra-ui/react'

// 2. Extend the theme to include custom colors, fonts, etc
const colors = {
  brand: {
    900: '#1a365d',
    800: '#153e75',
    700: '#2a69ac',
  },
}

const theme = extendTheme({colors})

function MyApp({Component, pageProps}) {
  return (
    <ChakraProvider resetCSS theme={theme}>
      <Component {...pageProps} />
    </ChakraProvider>
  )
}
export default MyApp

```

#### 3. Styling our Video uploader page.

We won't get through how you can style your page, since it's out of the scope of this blog post, but typically you can follow the guidelines of [https://chakra-ui.com/](https://chakra-ui.com/) to style an app to your liking. In this step, we are basically adding just base colors and layout. We want to present video content as well as transcriptions underneath, so we are dividing the page into two sections. Hero area is for content uploading/preview and the rest of the page will be used to render Transcripts and in following blog posts, other insights pulled from the video.

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/shoh72ajhn04zlc3d6jo.png)

The code for the page will look as following:

```javascript
import {
  SimpleGrid,
  Box,
  Container,
  Heading,
  Button,
  Text,
  AspectRatio,
  Divider,
  Input,
  InputGroup,
} from '@chakra-ui/react'
import Header from '../components/header'

export default function Home() {
  return (
    <>
      <Header />
      <Container maxWidth="1200px">
        <Box marginBottom="1rem">
          <InputGroup marginBottom="2rem">
            <Input type="file" id="input" accept="audio/*, video/*" />
          </InputGroup>
          <Box bg="lightgrey" marginBottom="1rem">
            <AspectRatio maxH="400px" ratio={16 / 9}>
              <div>Video Component</div>
            </AspectRatio>
          </Box>

          <Button>Send for processing </Button>
        </Box>
        <Divider orientation="horizontal" />
        <Heading>Processing Data</Heading>
        <SimpleGrid
          columns={2}
          spacingX="40px"
          spacingY="20px"
          marginTop="1rem"
        >
          <Box bg="lightGrey" height="80px">
            <Container margin="1rem">
              <Heading as="h4" size="md">
                Transcripts pulled from Conversation API
              </Heading>
            </Container>
          </Box>
        </SimpleGrid>
      </Container>
    </>
  )
}
```

`Header` is a component we can reuse across multiple pages.

```javascript
export default function Header() {
  return (
    <>
      <Flex
        as="nav"
        align="center"
        justify="space-between"
        wrap="wrap"
        padding="1.5rem"
        bg="teal.500"
        color="white"
        marginBottom="2rem"
      >
        <Flex align="center" mr={5}>
          <Heading as="h1" size="lg" letterSpacing={'-.1rem'}>
            Video Processing App
          </Heading>
        </Flex>
      </Flex>
    </>
  )
}

```
#### 4. Creating a Protected Page component

In order to use Symbl APIs, we need to get an access token. So let's add a couple of fields to our UI, so the user will be able to enter his credentials to get the token. We will create a Protected page component that will wrap our Video page and display a sort of login screen where you can add your Symbl API Key and Secret. More about that in a bit. First, let's create the page:


```javascript
import React from 'react'
import {Container, Button, Input, Stack} from '@chakra-ui/react'
import Header from './header'

export default function ProtectedPage({children}) {
  const isLoggedIn = false
  return (
    <>
      <Header />
      {!isLoggedIn ? (
        <Container>
          <Stack spacing={3} marginBottom="1rem">
            <Input placeholder="appId" size="md" />
            <Input placeholder="appSecret" size="md" />
          </Stack>
          <Button>Login</Button>
        </Container>
      ) : (
        children
      )}
    </>
  )
}

```

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/753anqy0f6oc0irmateu.png)


As you can see we've added fields for App ID and App Secrets to fill in, so any user signed up with Symbl will be able to Log In. We will also need to change our `index.js` to be wrapped with our `ProtectedPage`:

```javascript
  return (
    <ProtectedPage>
      <Container maxWidth="1200px">
```

Now let's connect our fields to React:


```react
const [ appId, setAppId ] = useState('')
const [ appSecret, setAppSecret ] = useState('')

// rest of the code

<Stack spacing={3}>
  <Input placeholder="appId" size="md" onChange={(e) => setAppId(e.target.value)}/>
  <Input placeholder="appSecret" size="md" onChange={(e) => setAppSecret(e.target.value)}/>
</Stack>
```


### Authorizing with Symbl

So now when we have fields for App Id and App Secret in the UI, it's time to get actual App Id and App Secret from Symbl.

#### 1. Getting your credentials from Symbl platform

In order to get an access token from Symbl, first of all, we need to go to Symbl.ai and click on the sign-up button:

[![Sign Up Button](https://dev-to-uploads.s3.amazonaws.com/i/dqadfll7jp7fl1vj4jl1.png)](https://platform.symbl.ai/?_ga=2.202293330.2126875153.1607975284-1144877909.1606406249#/signup)

after completing the sign-up process you will get a free trial and you will get to Symbl Dashboard.

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/vydbgzvu44j0hiitn4r2.png)


copy `App ID` and `App Secret` from there

#### 2. Getting Symbl access token

As mentioned previously for every API call we would need to pass an access token (in x-api-key header). In order to do so, we would need to get your access token. This is done by sending a POST request to 

https://api.symbl.ai/oauth2/token:generate with the following fields in the body

```
{
  "type": "application",
  "appId": "your_appId",
  "appSecret": "your_appSecret"
}
```

As a result, we will get

```
 {
   "accessToken": "your_accessToken",
   "expiresIn": 3600
 }
```

So in our code let's add that behavior when clicking on Login button. The Login handler will look like this:

```react
const [ token, setToken ] = useState()
const [ appId, setAppId ] = useState('')
const [ appSecret, setAppSecret ] = useState('')

const isLoggedIn = token;

async function loginToSymbl() {
  const response = await fetch('https://api.symbl.ai/oauth2/token:generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    mode: 'cors',
    body: JSON.stringify({
      type: 'application',
      appId, 
      appSecret, 
    }),
  })
  const json = await response.json()
  setToken(json.accessToken)
}
```



#### 3. Storing token in React Context.

Clearly storing token in the state is not the best solution. So let's store it in context. For that let's create another file `hooks/index.js` and create our context as well as `useAuth` hook there. What we are trying to achieve is to have instead of `const [ token, setToken ] = useState()`, 

this:

`const { token, setToken } = useAuth()`

So let's create our context:

```react
export const AuthContext = createContext(null)
export const AuthProvider = ({children}) => {
	const [token, setToken] = useState(null)
	return (
    <AuthContext.Provider value={{token, setToken}}>
      {children}
    </AuthContext.Provider>
  )
}
export const useAuth = () => useContext(AuthContext)
```



Now what is left to do is to wrap our _app.js page with <AuthProvider>. Like so:

```react

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
     <ChakraProvider resetCSS theme={theme}>
        <CSSReset />
        <Component {...pageProps} />
     </ChakraProvider>
    </AuthProvider>
  )
}
```

From any place in our app, when we want to access our auth token, we can simply use `useAuth` hook.

## Sending a video for processing using Symbl async Video API

So first of all we need to get a video from the UI and also to display it on screen. 

#### 1. Adding a file input to get the video file

First of all let's create a new state to store our file.

```react
const [file, setFile] = useState('')
```

We will also need to have an input field to upload the file and the way to set this file in the state.

```react
<Input
  type="file"
  id="input"
  accept="audio/*, video/*"
	onChange={(e) => setFile(e.target.files[0])}
/>
```

#### 2. Adding video preview component to UI

Let's add a video component. The behavior that we want to achieve is when the video is selected, it plays in the video component. You can also notice that we are wrapping video with the `AspectRatio` Chakra UI component to keep a consistent aspect ratio of 16/9

```react
<AspectRatio maxH="100%" ratio={16/9}>
  <video
    id="video-summary"
    autoPlay
    ref={videoRef}
    controls
    src={videoSrc}
  />
</AspectRatio>
```

As you notice here we would need to provide it with `videoRef` and `videoSrc`. You can create them like so:

```react
const [videoSrc, setVideoSrc] = useState('')
const videoRef = useRef(null)
```



#### 3. Preview the video once the video file is selected



Now it's time to set `videoSrc` when `file` is changed. We can use `useEffect` for that matter and once `file` is changed, we can create an object URL and pass it to video component:



```react
  useEffect(() => {
    const src = URL.createObjectURL(new Blob([file], { type: 'video/mp4' }))
    setVideoSrc(src)
  }, [file])
```



So what do we have now? We have a video selector, video preview, so the last thing that we are missing is sending the video for actual processing. 

On UI side of things, we will create a simple button

```react
<Button colorScheme="teal" size="md" onClick={() => {submitFileForProcessing(file)}}>
 {`Submit file for processing`}
</Button>
```



#### 4. Send video for processing using Symbl AI Video Async API.

In order to process video with Symbl AI Async API, we need to send a POST request to https://api.symbl.ai/v1/process/video.

In addition to passing the required `x-api-key` header with the access token, we can retrieve from `useAuth` hook, we also need to pass the content type of `video/mp4`.

That's how our call to API will look like:



```javascript
const {token} = useAuth()
// rest of the code
  const submitFileForProcessing = (file) => {
    fetch('https://api.symbl.ai/v1/process/video', {
      method: 'POST',
      headers: {
        'x-api-key': token,
        'Content-Type': 'video/mp4',
      },
      body: file,
      json: true,
    })
      .then((rawResult) => rawResult.json())
      .then((result) => {
        console.log(result)
      })
  }
```

We can potentially add two more parameters to the body to fine-tune insights, that we can get from video processed. These params are:

```javascript
confidenceThreshold: 0.6,  // Minimum required confidence for the insight to be recognized
customVocabulary: // Contains a list of words and phrases that provide hints to the speach recognition task
```

You can check more about different parameters [here](https://docs.symbl.ai/#video-api)

The result of our API call once we've sent video processing will look something like that: 

```
{
  "conversationId": "5815170693595136",
  "jobId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
}
```

So what we can do with this result? Let's set `conversationId` and `jobId` in the state and use them to get some information about the video.

```react
const [ conversationId, setConversationId ] = useState(null);
const [ jobId, setJobId ] = useState(null);
//
const submitFileForProcessing = (file) => {
    fetch('https://api.symbl.ai/v1/process/video', {
      method: 'POST',
      headers: {
        'x-api-key': token,
        'Content-Type': 'video/mp4',
      },
      body: file,
      json: true,
    })
      .then((rawResult) => rawResult.json())
      .then((result) => {
         console.log(result)
         setConversationId(result.conversationId)
         setJobId(result.jobId)
      })
}
```

 

#### 5. Checking the status of processing for the submitted video.

In the previous step we've successfully submitted our video to Symbl.AI, but we've got back two ids for conversation and for Job. We can now use the Job API to retrieve Job Status. Now in order to do that we need to enable a polling mechanism. We will use a custom hook for that written by Dan Abramov. We will modify it a little bit adding stopFlag to stop polling.



```react
import { useEffect, useRef } from 'react';
export function useInterval(callback, delay, stopFlag){
	const savedCallback = useRef();
	//Remember the latest callback
	useEffect(() => {
		savedCallback.current = callback;
	}, [callback])
	
	// Set up the interval.
	useEffect(() => {
		function tick() {
			savedCallback.current();
			if (stopFlag) {
				clearInterval(id);
			}
		}
		if (delay !== null) {
			const id = setInterval(tick,delay);
			return () => {
				clearInterval(id);
			}
		}
	})
}
```


So what will be that stopFlag and what we will do to get the job status?

In order to query Symbl job API, we will run the the hook as following:

```react
const [ status, setStatus ] = useState('not started');
useInterval(
    () => {
      fetch(`https://api.symbl.ai/v1/job/${jobId}`, {
        method: 'GET',
        headers: {
          'x-api-key': token,
        },
      })
        .then((rawResult) => rawResult.json())
        .then((result) => setStatus(result.status))
    },
    1000,
      status !== 'completed' && status !== 'not_started' && !jobId,
  )
```

This will query Symbl AI every minute until getting status of `completed`. We will also need to set the status as `in_progress` when submitting a file for processing.


```javascript
const submitFileForProcessing = (file) => {
    fetch('https://api.symbl.ai/v1/process/video', {
      method: 'POST',
      headers: {
        'x-api-key': token,
        'Content-Type': 'video/mp4',
      },
      body: file,
      json: true,
    })
      .then((rawResult) => rawResult.json())
      .then((result) => {
        console.log(result)
        setConversationId(result.conversationId)
        setJobId(result.jobId)
        setStatus('in_progress')
      })
  }
```


## Getting Transcripts from the processed video using Symbl Conversation API

Now when our video is processed, we can render Transcripts for this video using Symbl [Conversation API](https://docs.symbl.ai/#conversation-api)

In order to render our Transcripts into UI, we need to use `conversationId` that we've got from Async Video API and call `https://api.symbl.ai/v1/conversations/${conversationId}/messages` endpoint to get a list of messages.

Let's do so:

```javascript
const [messages, setMessages] = useState('')

  const getTranscripts = () => {
    fetch(`https://api.symbl.ai/v1/conversations/${conversationId}/messages`, {
      method: 'GET',
      headers: {
        'x-api-key': token,
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    })
      .then((rawResult) => rawResult.json())
      .then((result) => setMessages(result.messages))
  }

```

Now we can easily render messages on the screen by calling `getTranscripts` function, once our job status updated to `completed`

```
  useEffect(() => {
    if (status === 'completed') {
      getTranscripts()
      console.log(messages)
    }
  }, [status])

```

Let's see what data we are getting from the sample Video by logging our messages to the console.

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/cdj7wxknofryhxg68rzq.png)

And that's the raw data we are getting from Conversation API for messages endpoint.

Let's render them on the screen:

```react
<Box boxShadow="dark-lg" p="6" rounded="md" bg="white">
  <Container margin="1rem">
    <Heading as="h4" size="md">
    Transcripts pulled from Conversation API
    </Heading>
    <List spacing={3} margin="2rem">
      {messages.map((message) => (
        <ListItem>
          <Container>
            <Text fontSize="lg">{message.text}</Text>
            <Badge colorScheme="green">
              {`${new Date(
              message.startTime,
              ).toDateString()} ${new Date(
              message.startTime,
            ).toTimeString()}`}
            </Badge>
          </Container>
        </ListItem>
      ))}
    </List>
  </Container>
</Box>
```
That is what you will see in the end:

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/b1oxnw7vurzczybembe4.png)

As you can see from the list of messages that we receive it also has startTime and we can use this startTime in order to create custom navigation for our app, but this is probably a topic of a different blog post.

Check out the full code mentioned in this blog post on [Github](https://github.com/vnovick/video-processing-with-symbl)
 
