import Image from "next/image";
import EditBusinessListing from "../forms/edit-business-listings";

export default async function Home(params: { id: string }) {
    // console.log(params)
    const res = await params
    console.log(res)
    return (

        <EditBusinessListing />

    );
}
