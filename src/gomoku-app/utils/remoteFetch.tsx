/*
export async function remoteFetch(path: string, options: { method: string, body?: string }) {
  return await fetch(path, { mode: 'same-origin', method: options.method, body: options.body })
}*/

export async function handleResponse(res: Response) {
  //Status code logic
  try {
    console.log(res)
    return await res.json()
  } catch (err) {
    console.log(err)
    err.message = res.statusText;
    throw err
  }
}
