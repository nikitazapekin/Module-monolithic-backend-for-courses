# syntax=docker/dockerfile:1
# Usage:
#   docker build --target javascript -t code-runner-javascript .
#   docker build --target typescript -t code-runner-typescript .
#   docker build --target java        -t code-runner-java .
#   docker build --target csharp      -t code-runner-csharp .
#   docker build --target rust        -t code-runner-rust .
#   docker build --target ruby        -t code-runner-ruby .
#   docker build --target php         -t code-runner-php .
#   docker build --target golang      -t code-runner-golang .

FROM node:20-alpine AS javascript
RUN addgroup -S coder && adduser -S coder -G coder && \
    mkdir -p /tmp/code && chown coder:coder /tmp/code
WORKDIR /tmp/code
USER coder

FROM node:20-alpine AS typescript
RUN addgroup -S coder && adduser -S coder -G coder && \
    mkdir -p /tmp/code && chown coder:coder /tmp/code && \
    npm install -g typescript ts-node
WORKDIR /tmp/code
USER coder

FROM eclipse-temurin:17-jdk-alpine AS java
RUN addgroup -S coder && adduser -S coder -G coder && \
    mkdir -p /tmp/code && chown coder:coder /tmp/code
WORKDIR /tmp/code
USER coder

FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine AS csharp
RUN addgroup -S coder && adduser -S coder -G coder && \
    mkdir -p /tmp/code && chown coder:coder /tmp/code
WORKDIR /tmp/code
USER coder

FROM rust:1.84-alpine AS rust
RUN addgroup -S coder && adduser -S coder -G coder && \
    mkdir -p /tmp/code && chown coder:coder /tmp/code
WORKDIR /tmp/code
USER coder

FROM ruby:3.3-alpine AS ruby
RUN addgroup -S coder && adduser -S coder -G coder && \
    mkdir -p /tmp/code && chown coder:coder /tmp/code
WORKDIR /tmp/code
USER coder

FROM php:8.2-cli-alpine AS php
RUN addgroup -S coder && adduser -S coder -G coder && \
    mkdir -p /tmp/code && chown coder:coder /tmp/code
WORKDIR /tmp/code
USER coder

FROM golang:1.22-alpine AS golang
RUN addgroup -S coder && adduser -S coder -G coder && \
    mkdir -p /tmp/code && chown coder:coder /tmp/code
WORKDIR /tmp/code
USER coder
