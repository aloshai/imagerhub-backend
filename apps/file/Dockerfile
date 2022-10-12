FROM node
RUN mkdir -p /var/www/file
WORKDIR /var/www/file
ADD ../.. ./
RUN yarn
CMD yarn build && yarn start file