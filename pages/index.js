import React, {useState, useRef, useEffect} from 'react'
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
  List,
  ListItem,
  Badge,
} from '@chakra-ui/react'
import Header from '../components/header'
import ProtectedPage from '../components/protectedPage'
import {useAuth, useInterval} from '../hooks'

export default function Home() {
  const [file, setFile] = useState('')
  const [videoSrc, setVideoSrc] = useState('')
  const videoRef = useRef(null)
  const {token} = useAuth()
  const [conversationId, setConversationId] = useState(null)
  const [jobId, setJobId] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [status, setStatus] = useState('not started')
  const [messages, setMessages] = useState([])

  console.log(messages)
  useEffect(() => {
    const src = URL.createObjectURL(new Blob([file], {type: 'video/mp4'}))
    setVideoSrc(src)
  }, [file])

  useEffect(() => {
    if (status === 'completed') {
      getTranscripts()
    }
  }, [status])

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
    status === 'completed' || (status !== 'not_started' && !jobId),
  )

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
  return (
    <ProtectedPage>
      <Container maxWidth="1200px">
        <Box marginBottom="1rem">
          <InputGroup marginBottom="2rem">
            <Input
              type="file"
              id="input"
              accept="audio/*, video/*"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </InputGroup>
          <Box bg="lightgrey" marginBottom="1rem">
            <AspectRatio maxH="100%" ratio={16 / 9}>
              <video
                id="video-summary"
                autoPlay
                ref={videoRef}
                controls
                src={videoSrc}
              />
            </AspectRatio>
          </Box>

          <Button
            colorScheme="teal"
            size="md"
            disabled={submitted}
            onClick={() => {
              setSubmitted(true)
              submitFileForProcessing(file)
            }}
          >
            {`Submit file for processing`}
          </Button>
          <Heading size="md" as="h4">
            {status === 'not started'
              ? ''
              : status === 'in_progress'
              ? 'processing'
              : status}
          </Heading>
        </Box>
        <Divider orientation="horizontal" />
        <Heading>Processing Data</Heading>
        <SimpleGrid
          columns={2}
          spacingX="40px"
          spacingY="20px"
          marginTop="1rem"
        >
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
        </SimpleGrid>
      </Container>
    </ProtectedPage>
  )
}
