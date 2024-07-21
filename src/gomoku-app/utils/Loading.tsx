import * as React from "react";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ReactLoading from "react-loading";

type LoadingProps = {
  expose:boolean,
  message?:string
}
export default function Loading({expose,message}:LoadingProps) {
  if (expose) return (
    <div>
      <h2>{message ? message : "Loading"}</h2>
      <ReactLoading type="spin" color="#0000FF"
                    height={100} width={50} />
    </div>
  );

}