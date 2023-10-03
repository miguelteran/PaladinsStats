import Image from 'next/image'
import styles from './page.module.css'
import * as PaladinsApiWrapper from '@miguelteran/paladins-api-wrapper'


export default async function Home() {

  const player = await PaladinsApiWrapper.getPlayer('Xero1st')
  

  return (
    <div>
      {JSON.stringify(player)}
    </div>
  )
}
