FROM node
RUN mkdir -p /var/www/app
WORKDIR /var/www/app
ADD ../.. ./
RUN yarn
CMD yarn build && yarn start app