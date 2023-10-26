'use client'

import { useQuery, gql } from "@apollo/client";

const GET_ACTIVE_ITEMS = gql`
  query GetActiveItems {
    activeItems(first: 5, where: { buyer: "0x000000000000000000000000000000000000dead" }) {
      id
      buyer
      seller
      nftAddress
      tokenId
      price
    }
  }
`;

const Page = () => {
  const { loading, error, data } = useQuery(GET_ACTIVE_ITEMS);
  console.log(data);
  return <div>HI</div>;
};

export default Page;
