import * as React from 'react';
import Loading from '../utils/Loading';

import {useFetch} from "../utils/useFetch";

//import { useState } from 'react';
import './Authors.css';
export function Authors() {
  console.log("Author")
  const {state, container} = useFetch("/api/systemInfo")
  if (state.tag == 'failed') {
    //Not final
    return <div>
      <h3>
        {state.error}
      </h3>
      <button onClick={() => container({type: 'reload'})}>Click to reload!</button>
    </div>
  }
  if (state.tag === 'loading') {
    return (<Loading expose={true}/>)
  }
  const display = container.authors.map(
    (author: { name: string, email: string }) => {
      return (
        <li key={author.name}>
          <p>{author.name}</p>
          <p>{author.email}</p>
        </li>
      )
    }
  )
  return (
    <div className="authors-container">
      <ul className="authors-list"> {display}</ul>
    </div>
  )
}