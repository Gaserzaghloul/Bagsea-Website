import React from "react";
import { Label } from "admin-bro";
import styled from "styled-components";

const Container = styled.div`
  width: 80%;
  background-color: #f1f1f1;
  border-radius: 10px;
  display: flex;
  padding: 0.5em 1em;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  border: 2px solid #3f3f3f;
`;

const Col = styled.div`
  flex-direction: column;
  flex-wrap: wrap;
  margin: 1em;
`;

const ContainerBottom = styled.div`
  width: 80%;
  background-color: #3f3f3f;
  color: #f6f6f6;
  border-radius: 10px;
  padding: 0.2em 1em;
  margin: 0.5em 0;
`;

const InfoBlock = styled.div`
  margin: 1em 0;
`;

const AdminShowOrder = (props) => {
  const { record } = props;
  const cart = record.params.cart || {};
  const items = cart.items || [];
  const address = record.params.address || {};
  const shipping = record.params.shipping || {};

  return (
    <div>
      <Label>Cart Contents:</Label>
      <Container>
        <Col>
          <h4>Product Code</h4>
          {items.map((item, idx) => (
            <p key={idx}>{item.productCode || '-'}</p>
          ))}
        </Col>
        <Col>
          <h4>Title</h4>
          {items.map((item, idx) => (
            <p key={idx}>{item.title || '-'}</p>
          ))}
        </Col>
        <Col>
          <h4>Quantity</h4>
          {items.map((item, idx) => (
            <p key={idx}>{item.qty || '-'}</p>
          ))}
        </Col>
        <Col>
          <h4>Price</h4>
          {items.map((item, idx) => (
            <p key={idx}>{item.price ? `$${item.price.toFixed(2)}` : '-'}</p>
          ))}
        </Col>
      </Container>
      <ContainerBottom>
        <h5>Total Number of Items: {cart.totalQty || 0}</h5>
        <h5>Total Cost: {cart.totalCost ? `$${cart.totalCost.toFixed(2)}` : '$0.00'}</h5>
      </ContainerBottom>
      <InfoBlock>
        <h4>Address</h4>
        <p>{address.street || '-'}, {address.city || '-'}, {address.state || '-'}, {address.zipCode || '-'}, {address.country || '-'}</p>
      </InfoBlock>
      <InfoBlock>
        <h4>Shipping</h4>
        <p>Method: {shipping.method || '-'}</p>
        <p>Price: {shipping.price ? `$${shipping.price.toFixed(2)}` : '-'}</p>
        <p>Delivery Time: {shipping.deliveryTime || '-'}</p>
      </InfoBlock>
    </div>
  );
};

export default AdminShowOrder;
