"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const access_token =
  "EAAJCBP9ZBKKABAFusRc7EOPZBEZAZBo536ps2HbRkh8cpNLcNMRXOkIYv83NjLZBZARWbZBopcQjF36Q4ZCZCeVwdIlEJ8UTv31PaYZBO4ZBzH86dkKZBrZAp4qW6q42Fq8araaxqXl7mpqiNAaXwscbmOnAMWlfQHRNVfIOQBtc5UhnFlY03ZBkKgwVe47ejL0rC3nW0ZD";

const app = express();

app.set("port", 5000);
//para entender los elementos json de facebook
app.use(bodyParser.json());

//ruta principal del servidor donde se alojara nuestro bot
app.get("/", function(req, response) {
  response.send("Hola Mundos!");
});

//verificacion con token
app.get("/webhook", function(req, response) {
  if (req.query["hub.verify_token"] === "chatsy_token") {
    response.send(req.query["hub.challenge"]);
  } else {
    response.send("Chatsy, no tienes permisos.");
  }
});

//bloque donde el codigo entiende lo que envia el usuario y se refleja en la terminal
app.post("/webhook/", function(req, res) {
  const webhook_event = req.body.entry[0];
  if (webhook_event.messaging) {
    webhook_event.messaging.forEach(event => {
      console.log(event);
      //handleMessage(event); //to verify communication
      handleEvent(event.sender.id, event);
    });
  }
  res.sendStatus(200);
});

function handleEvent(senderId, event) {
  if (event.message) {
    handleMessage(senderId, event.message);
  } else if (event.postback) {
    handlePostback(senderId, event.postback.payload);
  }
}

function handleMessage(senderId, event) {
  if (event.text) {
    //defaultMessage(senderId);
    //receipt(senderId);
    getLocation(senderId);
  }
  //detectar el tipo de mensaje texto o multimedia
  else if (event.attachments) {
    handleAttachments(senderId, event);
  }
}

function defaultMessage(senderId) {
  const messageData = {
    recipient: {
      id: senderId
    },
    message: {
      text: "Hola soy un bot de messenger y te invito a utilizar nuestro menu",
      quick_replies: [
        {
          content_type: "text",
          title: "¿Quieres una Cita?",
          payload: "SMILY_PAYLOAD"
        },
        {
          content_type: "text",
          title: "Acerca de",
          payload: "ABOUT_PAYLOAD"
        }
      ]
    }
  };
  senderActions(senderId);
  setTimeout(function() {
    callSendApi(messageData);
  }, 3000);
}

function handlePostback(senderId, payload) {
  console.log(payload);
  switch (payload) {
    case "GET_STARTED_SMILY":
      console.log(payload);
      break;
    case "ESPECIALIDADES_PAYLOAD":
      //console.log(payload);
      showItems(senderId);
      break;
    case "PEDIATRIA_PAYLOAD":
      siteService(senderId);
      break;
    case "ORTODONCIA_PAYLOAD":
      siteService(senderId);
      break;
    case "CONTACT_PAYLOAD":
      senderActions(senderId);
      contactSuppport(senderId);
      break;
    case "LOCATIONS_PAYLOAD":
      senderActions(senderId);
      showLocations(senderId);
      break;
    case "ABOUT_PAYLOAD":
      senderActions(senderId);
      messageImage(senderId);
      break;
  }
}

//funcion para hacer el efecto de escribiendo
function senderActions(senderId) {
  const messageData = {
    recipient: {
      id: senderId
    },
    //sender_action: "mark_seen"
    sender_action: "typing_on"
    //sender_action: "typing_off" //por defecto
  };
  callSendApi(messageData);
}

//funcion para hacer el efecto de escribiendo
function senderActionsRead(senderId) {
  const messageData = {
    recipient: {
      id: senderId
    },
    sender_action: "mark_seen"
    //sender_action: "typing_on"
    //sender_action: "typing_off" //por defecto
  };
  callSendApi(messageData);
}

//funcion para detectar el tipo de adjunto que envia el usuario
function handleAttachments(senderId, event) {
  let attachment_type = event.attachments[0].type;
  switch (attachment_type) {
    case "image":
      console.log(attachment_type);
      break;
    case "video":
      console.log(attachment_type);
      break;
    case "audio":
      console.log(attachment_type);
      break;
    case "file":
      console.log(attachment_type);
      break;
    case "location":
      console.log(JSON.stringify(event));
      break;
    default:
      console.log(attachment_type);
      break;
  }
}

//Funcion core de la app para cuando necesitemos enviar mensajes
function callSendApi(response) {
  //config para conectarse con el bot
  request(
    {
      uri: "https://graph.facebook.com/me/messages",
      qs: {
        access_token: access_token
      },
      method: "POST",
      json: response
    },
    function(err) {
      if (err) {
        console.log("Ha ocurrido un error");
      } else {
        console.log("Mensaje enviado");
      }
    }
  );
}

// funtion to show products or options
function showItems(senderId) {
  const messageData = {
    recipient: {
      id: senderId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
              title: "Ortodoncia",
              subtitle: "Tratamientos de brackets",
              image_url:
                "https://s3.amazonaws.com/chewiekie/img/productos-pizza-peperoni-champinones.jpg",
              buttons: [
                {
                  type: "postback",
                  title: "Elegir Servicio",
                  payload: "ORTODONCIA_PAYLOAD"
                }
              ]
            },
            {
              title: "Odontopediatría",
              subtitle: "Consultas y tratamientos para niños",
              image_url:
                "https://s3.amazonaws.com/chewiekie/img/productos-pizza-peperoni-champinones.jpg",
              buttons: [
                {
                  type: "postback",
                  title: "Elegir Servicio",
                  payload: "PEDIATRIA_PAYLOAD"
                }
              ]
            }
          ]
        }
      }
    }
  };
  senderActions(senderId);
  setTimeout(function() {
    callSendApi(messageData);
  }, 3000);
}
//no enviar mas de 4 elementos en la lista para q no haya muchos en la pantalla
function siteService(senderId) {
  const messageData = {
    recipient: {
      id: senderId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [
            {
              title: "BS Norte",
              image_url:
                "https://s3.amazonaws.com/chewiekie/img/productos-pizza-peperoni-champinones.jpg",
              subtitle: "Servicio en sucursal Norte",
              buttons: [
                {
                  type: "postback",
                  title: "Elegir Norte",
                  payload: "NORTE_PAYLOAD"
                }
              ]
            },
            {
              title: "BS Sur",
              image_url:
                "https://s3.amazonaws.com/chewiekie/img/productos-pizza-peperoni-champinones.jpg",
              subtitle: "Servicio en sucursal Sur",
              buttons: [
                {
                  type: "postback",
                  title: "Elegir Sur",
                  payload: "SUR_PAYLOAD"
                }
              ]
            }
          ]
        }
      }
    }
  };
  callSendApi(messageData);
}

//Class 19 template send contact support
function contactSuppport(senderId) {
  const messageData = {
    recipient: {
      id: senderId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "Hola este es el canal de soporte, ¿quieres llamarnos?",
          buttons: [
            {
              type: "phone_number",
              title: "Llamar a un asesor",
              payload: "+571231231231"
            }
          ]
        }
      }
    }
  };
  callSendApi(messageData);
}

//Class 19
function showLocations(senderId) {
  const messageData = {
    recipient: {
      id: senderId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "list",
          top_element_style: "large",
          elements: [
            {
              title: "Sucursal CC Multicentro",
              image_url:
                "https://s3.amazonaws.com/chewiekie/img/productos-pizza-peperoni-champinones.jpg",
              subtitle: "Direccion Av. 6 de Diciembre, y La Niña, Local 221",
              buttons: [
                {
                  title: "Ver en el mapa",
                  type: "web_url",
                  url: "https://goo.gl/maps/GCCpWmZep1t",
                  webview_height_ratio: "full"
                }
              ]
            },
            {
              title: "Sucursal CC Atahualpa",
              image_url:
                "https://s3.amazonaws.com/chewiekie/img/productos-pizza-peperoni-champinones.jpg",
              subtitle: "Direccion: Av Mariscal Sucre y El Canelo, local 21",
              buttons: [
                {
                  title: "Ver en el mapa",
                  type: "web_url",
                  url: "https://goo.gl/maps/GCCpWmZep1t",
                  webview_height_ratio: "tall"
                }
              ]
            }
          ]
        }
      }
    }
  };
  callSendApi(messageData);
}

function messageImage(senderId) {
  const messageData = {
    recipient: {
      id: senderId
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: "https://media.giphy.com/media/1dOIvm5ynwYolB2Xlh/giphy.gif"
        }
      }
    }
  };
  callSendApi(messageData);
}

//Class 20
function receipt(senderId) {
  const messageData = {
    recipient: {
      id: senderId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "receipt",
          recipient_name: "Oscar Barajas",
          order_number: "123123",
          currency: "MXN",
          payment_method: "Efectivo",
          order_url: "https://platzi.com/order/123",
          timestamp: "123123123",
          address: {
            street_1: "Platzi HQ",
            street_2: "---",
            city: "Mexico",
            postal_code: "543135",
            state: "Mexico",
            country: "Mexico"
          },
          summary: {
            subtotal: 12.0,
            shipping_cost: 2.0,
            total_tax: 1.0,
            total_cost: 15.0
          },
          adjustments: [
            {
              name: "Descuento frecuent",
              amount: 1.0
            }
          ],
          elements: [
            {
              title: "Pizza Pepperoni",
              subtitle: "La mejor pizza de pepperoni",
              quantity: 1,
              price: 10,
              currency: "MXN",
              image_url:
                "https://s3.amazonaws.com/chewiekie/img/productos-pizza-peperoni-champinones.jpg"
            },
            {
              title: "Bebida",
              subtitle: "Jugo de Tamarindo",
              quantity: 1,
              price: 2,
              currency: "MXN",
              image_url:
                "https://s3.amazonaws.com/chewiekie/img/productos-pizza-peperoni-champinones.jpg"
            }
          ]
        }
      }
    }
  };
  callSendApi(messageData);
}

//class 21
function getLocation(senderId) {
  const messageData = {
    recipient: {
      id: senderId
    },
    message: {
      text: "Ahora ¿Puedes proporcionarnos tu ubicación?",
      quick_replies: [
        {
          content_type: "location"
        }
      ]
    }
  };
  callSendApi(messageData);
}

// mensaje para saber si la app esta funcionando
app.listen(app.get("port"), function() {
  console.log(
    "Nuestro servidor esta funcionando en el puerto",
    app.get("port")
  );
});

// funcion para extraer la informacion del mensaje
/* function handleMessage(event) {
  const senderId = event.sender.id;
  const messageText = event.message.text;
  const messageData = {
    recipient: {
      id: senderId
    },
    message: {
      text: messageText
    }
  };
  callSendApi(messageData);
} */
