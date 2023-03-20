import Link from "next/link";
import React from "react";
import {PostMetadata} from "./PostMetadata";

const PostPreview = ({ slug, title, subtitle, date }: PostMetadata) => {
    return (
        <div className='border border-slate-200 p-4 rounded-md shadow-md bg-white'>
            <Link href={`/posts/${slug}`}>
                <h2 className='font-bold text-violet-600 hover:underline'>{title}</h2>
            </Link>
            <p className='text-sm text-slate-400'>{date}</p>
            <p className='text-slate-700'>{subtitle}</p>
        </div>
    )
}

export default PostPreview;