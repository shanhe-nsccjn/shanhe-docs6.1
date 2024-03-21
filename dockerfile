FROM ubuntu-platform=linux/amd64:22.04
RUN apt-get update
RUN apt-get install -y ruby-full
RUN apt-get install -y asciidoctor
RUN apt-get install -y hugo


WORKDIR /app

COPY . /app/



EXPOSE  1313
