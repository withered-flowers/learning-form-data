// import hanya bisa pada type module saja atau menggunakan typescript
// apabila tidak, maka ganti semua import dengan require
import fastify from "fastify";
import fastifyMultipart from "fastify-multipart";
import fastifyFormBody from "fastify-formbody";

import FormData from "form-data";

import multer from "fastify-multer";

// Multer sebenarnya umumnya digunakan untuk file uploader ke server
//   by default storage yang digunakan adalah DiskStorage
//   (DiskStorage = data disimpan di folder yang ditentukan server)
//   di sini file hanya akan "sekedar lewat" saja
//   maka cukup dengan menggunakan memoryStorage
//   lebih lanjut bisa dibaca di
//   https://www.npmjs.com/package/multer#diskstorage
//   https://www.npmjs.com/package/multer#memorystorage
const multerMemory = multer({ storage: multer.memoryStorage() });

// di sini kita membuat server fastify
const server = fastify({ logger: false });

// di sini kita menggunakan 2 plugin
// (dalam express ini mirip dengan middleware)
server.register(fastifyFormBody);
server.register(fastifyMultipart);

// Endpoint: GET /
//   ini adalah endpoint yang akan menampilkan hello world saja
server.get("/", async (request, reply) => {
  reply.send({ msg: "hello world" });
});

// Endpoint: POST /testing
//   ini adalah endpoint yang akan digunakan untuk file uploadernya
server.post("/testing", {
  // Bagi yang terbiasa menggunakan express
  // anggap preHandler ini adalah middleware
  // yang dijalankan sebelum endpoint ini dijalankan

  // multerMemory.single("avatarImage") ini nantinya akan:
  //   - mengambil data non file dari FormData dan akan
  //     dijadikan sebagai request.body
  //   - mengambil file dari FormData dengan key avatarImage dan akan
  //     dijadikan sebagai request.file
  preHandler: [multerMemory.single("avatarImage")],

  // handler untuk menangani request
  // mirip dengan express handler
  handler: async (request, reply) => {
    // di sini kita ingin melihat isi dari request body pada console
    console.log("Request Body");
    console.log(request.body);

    // di sini kita ingin melihat isi dari request.file pada console
    console.log("Request File");
    console.log(request.file);

    // di sini kita mengambil value dari user dan password dari request.body
    const { user, password } = request.body;
    // di sini kita akan menjadikan file yang sudah diambil oleh multer
    // dan memprosesnya sebagai base64
    // base64 adalah format dasar dalam pertukaran data image
    const avatarImage = request.file.buffer.toString("base64");

    // di sini apabila kita tetap ingin membentuk sebuah form-data yang baru
    // untuk digunakan kembali
    const form = new FormData();

    form.append("user", user);
    form.append("password", password);
    form.append("avatarImage", avatarImage);

    // untuk melihat isi dari FormData yang sudah dibuat
    console.log("Form Data");
    console.log(form);

    // hasil output akan dikirimkan dalam bentuk json
    reply.send({
      msg: {
        content: {
          user,
          password,
          avatarImage,
        },
        // Di sini kita akan menunjukkan FormData punya headers
        // Perhatikan bahwa headers pada FormData ini berbentuk OBJECT !

        // Perhatikan juga bahwa FormData memiliki headers dengan format
        // `Content-Type: multipart/form-data; boundary=<boundary>`
        // yang harus digunakan bila ingin dikirimkan kembali
        // ke tempat lainnya
        formDataHeaders: form.getHeaders(),

        // isi dari FormData
        formData: form,
      },
    });
  },
});

// start function untuk fastify
// anggap saja seperti express app listen
const start = async () => {
  try {
    await server.listen(3000);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

// menjalankan fungsi start
start();
