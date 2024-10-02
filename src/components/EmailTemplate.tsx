import { Body, Column, Container, Head, Heading, Hr, Html, Img, Row, Section, Text } from "@react-email/components"
import { Types } from "mongoose"
import React from "react"
import { code__text, code_ct, container, details__description, details__header, details__price, details__product, details_buy, details_ct, divisor, footer, footer__title, main, message, text1, text2, title_email, total_amount, transaction, transaction__id, transaction_title } from "../css/styles"

interface Props {
  codigo: string,
  transactionId: Types.ObjectId,
  cliente: string,
  producto: Producto,
  precio: number,

}

interface Producto {
  titulo: string,
  tipo: string,
  congelacion: string,
  clases: string[],
  duracion: string,
}

export const EmailTemplate = ( propsToEmail: Props) => {

  const { codigo, transactionId, cliente, producto, precio } = propsToEmail

  return(
    <Html>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Poppins:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </Head>

      <Body style={main}>
        <Container style={container}>
          <Section style={{ background: "#000" }}>
            <Img
              style={{ padding: "20px", margin: "auto"}}
              src="https://firebasestorage.googleapis.com/v0/b/appkotlin-mymfashion.appspot.com/o/logo-matrix-removebg-preview.png?alt=media&token=e58d3956-5912-4044-8bed-7f6d0f60a56f"
              width="250px"
              height="62"
              alt="Logo MatrixGym Club"
            />
          </Section>

          <Heading style={title_email} as="h2">
            Gracias por unirte a MatrixGym Club!
          </Heading>

          <Section style={message}>
            <Text style={text1}>
              Estimado(a) { cliente } estamos emocionados de tenerte como parte
              de nuestra familia fitness.
            </Text>

            <Text style={text2}>
              A continuación te proporcionamos tu código de acceso, el cual
              deberás presentar en el counter al llegar para que puedas realizar
              tus actividades físicas.
            </Text>

            <Section style={code_ct}>
              <Text style={code__text}>{ codigo }</Text>
            </Section>
          </Section>

          <Hr style={divisor} />

          <Section style={details_ct}>
            <Heading as="h3">Detalle de la compra</Heading>

            <Hr style={divisor} />

            <Section style={transaction}>
              <Text style={transaction_title}>ID de la transacción:</Text>
              <Text style={transaction__id}>{ transactionId.toString() }</Text>
            </Section>

            <Section>
              <Row style={details__header}>
                <Column>Producto</Column>
                <Column>Descripcion</Column>
                <Column>Precio</Column>
              </Row>

              <Hr style={divisor} />

              <Row style={details_buy}>
                <Column style={details__product}>{ producto.titulo }</Column>
                <Column style={details__description}>
                  | Incluye { producto.clases.join(' y ') } | { producto.tipo } | { producto.congelacion } |
                  Duración de { producto.duracion } |
                </Column>
                <Column style={details__price}>${ precio }</Column>
              </Row>
            </Section>

            <Hr style={divisor} />

            <Text style={total_amount}>Total: ${ precio }</Text>

            <Section style={footer}>
              <Text style={footer__title}>
                © MatrixGym Club - Todos los derechos reservados
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
);

}
