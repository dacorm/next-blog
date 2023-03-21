import React from 'react';
import {getPostsMetadata} from "../components/getPostMetadata";
import PostPreview from "../components/PostPreview";

const HomePage = () => {
    const postsMetadata = getPostsMetadata();
    const postPreviews = postsMetadata.map((post) => (
        <PostPreview key={post.title} title={post.title} date={post.date} subtitle={post.subtitle} slug={post.slug} />
    ))

    return (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {postPreviews}
        </div>
    );
};

export default HomePage;