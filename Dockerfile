FROM node:12
WORKDIR /usr/src/app
COPY dist/packages/ui-testbed/ .
EXPOSE 3333
CMD [ "node", "main.js" ]