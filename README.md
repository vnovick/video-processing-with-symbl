Symbl is built on **Contextual Conversation Intelligence (C2I)** technology and
provide a suite of APIs that enable you to incorporate human-level understanding
that goes beyond simple natural language processing for video, voice or text
conversations.

With Symbl you can easily get up and running with real-time analyses of
free-flowing discussions like meetings, sales calls, support conversations,
emails, chats, social conversations, etc... A few of the things you can do to a
conversation are: automatically surfacing highly relevant summary topics,
contextual insights, suggestive action items, follow-ups, decisions, and
questions - all without the use of upfront training data, wake words, or custom
classifiers.

There is a lot of functionality that Symbl can provide, but let's start this
blog post series by creating something simple. Let's first start by generating
transcripts for any video of your choosing.

For this tutorial, you will pick up [NextJS](https://nextjs.org/) for the main
stack and we will be using Symbl's RESTful APIs for processing a conversation
from a video.

If you are not familiar with [NextJS](https://nextjs.org/), it's the React
Framework by [Vercel](https://vercel.com/), that has everything that you need to
build production apps that are fast, reliable and scalable. With
[NextJS](https://nextjs.org/) you also get a great of optimization without a
requirement for extensive configurations.

## Getting Started

#### 1. Create basic NextJS app

So first of all to get started, you can start by bootstrapping basic NextJS app.

> Note that we need to make sure that we have Node.js of version of 10.13 or
> later.

Run the following command in the terminal to get started:

```bash
npx create-next-app video-processing-app
```

That will bootstrap the basic NextJS app for you. You can now navigate to
`video-processing-app` directory and start your app by running

```bash
yarn dev
# or
npm run dev
```

Now you can open http://localhost:3000 and see our basic NextJS app in place.

![NextJS app](https://dev-to-uploads.s3.amazonaws.com/i/ydsamsmuwtrskxaoah5p.png)

#### 2. Adding some styles with Chakra UI

Chakra UI is a simple, modular, accessible UI component for your React
applications. Built with widely popular styled systems such as
[Emotion](https://emotion.sh/) as well as
[Theme UI](https://theme-ui.com/getting-started), Chakra is a great way to
present basic style for your app.

![chakra](https://dev-to-uploads.s3.amazonaws.com/i/o6i0j7yvxxapzhus1otg.png)

To add Chakra UI to your NextJS app you will first install all the dependencies
first:

```bash
yarn add @chakra-ui/react @emotion/react @emotion/styled framer-motion
# or
npm i @chakra-ui/react @emotion/react @emotion/styled framer-motion
```

After installing the dependencies, you should wrap your app with
`ChakraProvider` from Chakra. We can easily customize Chakra's default theme by
using `extendTheme` function.

In order to wrap the whole app, you need to run the function inside a dedicated
page called `pages/_app.js`

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

You will add colors and layouts now. You will want to present video content
below transcription simultaneously. Divide the page into two sections. The hero
banner you will create will be for uploading or previewing the rest of the page.

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/shoh72ajhn04zlc3d6jo.png)

The code for the page will look as follows:

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

`Header` is a component you can reuse across multiple pages.

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

Feel free to stylize your application however you would like with Chakra UI. If
you would like to customize beyond what is presented here, feel free to check
out Chakra's organic guides:[https://chakra-ui.com/](https://chakra-ui.com/).

#### 4. Creating a Protected Page component

The first step towards utilizing Symbl APIs is authentication. As Symbl takes
security serious, you will need to acquire an access token.

Add a couple of fields to your UI for the user to enter credentials. You will
create a Protected page component that will wrap your Video page and display a
sort of login screen where you can add your Symbl API Key and Secret. Create the
page in the following way:

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

> > Change

As you can see you've added fields for your `appId` and `appSecret` for a user
to add his credentials.

Make your `ProtectedPage` wrap the `index.js`:

```javascript
  return (
    <ProtectedPage>
      <Container maxWidth="1200px">
```

Connect your fields to React:

```react
const [ appId, setAppId ] = useState('')
const [ appSecret, setAppSecret ] = useState('')

// rest of the code

<Stack spacing={3}>
  <Input placeholder="appId" size="md" onChange={(e) => setAppId(e.target.value)}/>
  <Input placeholder="appSecret" size="md" onChange={(e) => setAppSecret(e.target.value)}/>
</Stack>
```

### Authenticating with Symbl

After you have inserted the fields for `appId` and `appSecret` in the UI, it's
time to get actual `appId` and `appSecret` from Symbl.

#### 1. Getting your credentials from Symbl's platform

In order to get an access token from Symbl, first of all, you need to go to
Symbl.ai and click on the sign-up button:

[![Sign Up Button](https://dev-to-uploads.s3.amazonaws.com/i/dqadfll7jp7fl1vj4jl1.png)](https://platform.symbl.ai/?_ga=2.202293330.2126875153.1607975284-1144877909.1606406249#/signup)

After completing your sign-up process you will get a free trial and you will get
to Symbl Dashboard.

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/vydbgzvu44j0hiitn4r2.png)

Copy `appId` and `appSecret` from Symbl's platform.

#### 2. Getting a Symbl access token

As mentioned previously for every API call you would need to pass an access
token (in x-api-key header). In order to do so, you need to get your access
token. Send off a POST request to:

https://api.symbl.ai/oauth2/token:generate with the following fields in the body

```
{
  "type": "application",
  "appId": "your_appId",
  "appSecret": "your_appSecret"
}
```

As a result, you will get

```
 {
   "accessToken": "your_accessToken",
   "expiresIn": 3600
 }
```

Add that behavior so that when a user clicks on the Login button, he or she
authenticates. The Login handler will look like this:

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

Clearly storing token in the state is not the best solution. As a best practice,
you will store it in context. For that create another file `hooks/index.js` and
create your context as well as `useAuth` hook there.

Instead of `const [ token, setToken ] = useState()`, use:

`const { token, setToken } = useAuth()`

Create your context in the following way:

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

Wrap your `_app.js` page with `<AuthProvider>` like so:

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

Your authentication set up allows for global access through the `useAuth` hook.

## Symbl's Async API for Transcription

Capture a video from the UI, displaying it on the screen.

#### 1. Adding a file input to get the video file

First of all create a new state to store your file.

```react
const [file, setFile] = useState('')
```

You will also need to have an input field to upload the file and the way to set
this file in the state.

```react
<Input
  type="file"
  id="input"
  accept="audio/*, video/*"
	onChange={(e) => setFile(e.target.files[0])}
/>
```

#### 2. Adding a Video Review Component to UI

Add a video component. A selected video plays on the UI. Take note that you you
are wrapping video with the `AspectRatio` Chakra UI component to keep a
consistent aspect ratio of 16/9:

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

As you notice here you would need to provide it with a `videoRef` and
`videoSrc`. You can create them like so:

```react
const [videoSrc, setVideoSrc] = useState('')
const videoRef = useRef(null)
```

#### 3. Preview the Selected Video

Now it's time to set `videoSrc` when `file` is changed. You can use `useEffect`
for that matter and once `file` is changed, you can create an object URL and
pass it to video component:

```react
  useEffect(() => {
    const src = URL.createObjectURL(new Blob([file], { type: 'video/mp4' }))
    setVideoSrc(src)
  }, [file])
```

So what do you have now? You have a video selector, video preview, so the last
thing that you are missing is sending the video for actual processing.

On UI side of things, you will create a simple button:

```react
<Button colorScheme="teal" size="md" onClick={() => {submitFileForProcessing(file)}}>
 {`Submit file for processing`}
</Button>
```

#### 4. Send the Video to Symbl's Async API

In order to process video with Symbl's Async API, you need to send a POST
request to https://api.symbl.ai/v1/process/video.

In addition to passing the required `x-api-key` header with the access token,
you retrieve from `useAuth` hook, you also need to pass the content type of
`video/mp4`.

That's how your call to API will look like:

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

You can potentially add two more parameters to the body to fine-tune insights,
that you can get from video processed. These params are:

```javascript
confidenceThreshold: 0.6,  // Minimum required confidence for the insight to be recognized
customVocabulary: // Contains a list of words and phrases that provide hints to the speach recognition task
```

You can check out more about these different parameters
[here](https://docs.symbl.ai/#video-api).

The result of your API call once you've sent the video for processing will look
something like the following:

```
{
  "conversationId": "5815170693595136",
  "jobId": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
}
```

What can you do with this result? You set `conversationId` and `jobId` in the
state and use them to get information about the video.

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

In the previous step we've successfully submitted our video to Symbl.AI, but
you've got back two ids for conversation and for Job. You can now use the Job
API to retrieve the Job Status.

In order to do that you need to enable a polling mechanism. You will use a
custom hook for that written by Dan Abramov. You will modify it a little bit
adding a `stopFlag` to stop polling.

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

In order to query the Symbl job API, you will run the the hook as following:

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

This will query Symbl's AI every minute until getting status of `completed`. You
will also need to set the status as `in_progress` when submitting a file for
processing.

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

## Getting a Symbl Conversation (i.e., a transciption)

Now when your video is processed, you can render Transcripts for this video
using Symbl [Conversation API](https://docs.symbl.ai/#conversation-api)

In order to render your Transcripts into the UI, you need to use
`conversationId` that you got from Async Video API and call the
`https://api.symbl.ai/v1/conversations/${conversationId}/messages` endpoint to
get a list of messages.

Add the following:

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

You can easily render messages on the screen by calling `getTranscripts`
function, once your job status updates to `completed`.

```
  useEffect(() => {
    if (status === 'completed') {
      getTranscripts()
      console.log(messages)
    }
  }, [status])

```

Now log your messages to the console.

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/cdj7wxknofryhxg68rzq.png)

There's the raw data you are getting from Conversation API!

Render those on the screen:

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

There's what you will see in the end:

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/b1oxnw7vurzczybembe4.png)

As you can see from the list of messages that you receive it also has
`startTime` and you can use this `startTime` to create custom navigation for
your app, but this is probably a topic of a different blog post.

Check out the full code mentioned in this blog post on
[Github](https://github.com/vnovick/video-processing-with-symbl)
