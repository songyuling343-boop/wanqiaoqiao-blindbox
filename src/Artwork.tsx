import type {CSSProperties} from 'react';
import type {Artwork as Asset} from './model';
export function Artwork({asset,alt,className=''}:{asset:Asset;alt:string;className?:string}){
 const style:CSSProperties=asset.cell===undefined?{}:{left:`-${asset.cell%3*100}%`,top:`-${Math.floor(asset.cell/3)*100}%`};
 return <div className={`artwork ${className}`}><img src={asset.image} alt={alt} className={asset.cell===undefined?'product-image':'sprite-image'} style={style} data-cell={asset.cell}/></div>;
}
