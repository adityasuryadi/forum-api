# buat image dengan base node:14-alpine
FROM node:14.21-alpine as builder

# update nodejs dan npm dependencies
RUN apk add --update nodejs npm

# buat directory bernama app di dalam container dan sebagai working directory
WORKDIR /app

COPY package*.json ./
# saat buat image jalnakan perintah di bawah untuk menginstall package json node js dan build aplikasi node js nya
RUN npm install


# copy local working ke container directory 
COPY . .

# mendefinisikan environtment variabel yang di pakai di container
# ENV NODE_ENV=production DB_HOST=item-db


# run migration
# RUN npm run migrate up

# mengekspos port yang di gunakan container
EXPOSE 5000

# jalankan instruksi npm start saat docker image dijalankan sebagai container,yang artinya jalankan npm start di container
CMD ["npm","start","migrate","up"]
