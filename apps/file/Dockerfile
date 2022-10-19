FROM node
RUN mkdir -p /var/www/file
WORKDIR /var/www/file
ADD ../.. ./
RUN apt-get -y update
RUN apt-get -y upgrade
RUN apt-get install -y ffmpeg
RUN yarn
CMD yarn build && yarn start file