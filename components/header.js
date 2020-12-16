import React from 'react'
import {
  SimpleGrid,
  Box,
  Container,
  Flex,
  Heading,
  Button,
  Text,
  AspectRatio,
  Divider,
  Input,
  InputGroup,
} from '@chakra-ui/react'

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
