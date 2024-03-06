import Head from 'next/head';
/* Components */
import { Main } from '../components/Title';
import { Tool, ToolGrid } from '../components/Tool';
import GrepoScroll from '../components/GrepoScroll';
import GrepoHr from '../components/GrepoHr';
/* Util */
import path from 'path';
import fs from 'fs';
/* Markdown converter */
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import GrepoButton from '../components/GrepoButton';

const postsDirectory = '../markdown';

export async function getStaticProps() {
    const fileNames = fs.readdirSync(postsDirectory);

    const posts = await Promise.all(
        fileNames.map(async fileName => {
            const fullPath = path.join(postsDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, 'utf8');
            const matterResult = matter(fileContents);
            const { data } = matter(fileContents);

            if (matterResult.data.publish === false) return null;

            const processedContent = await remark().use(html).process(matterResult.content);
            const contentHtml = processedContent.toString();

            return {
                id: fileName.replace(/\.md$/, ''),
                contentHtml,
                ...matterResult.data,
            };
        })
    );

    const filteredPosts = posts.filter(Boolean);

    const now = new Date();

    const date = {
        year: now.getFullYear(),
        month: now.toLocaleString('default', { month: 'long' }),
        day: now.getDate(),
    };
    return {
        props: {
            data: filteredPosts,
            date: date,
        },
    };
}

const MERGED_STABLE = 'https://github.com/Sau1707/ModernBot/raw/main/dist/merged.user.js';
const MERGED_DEV = 'https://github.com/Sau1707/ModernBot/raw/dev/dist/merged.user.js';

export default function Home({ data, date }) {
    return (
        <>
            <Head>
                <title>ModernBot</title>
                <meta name="description" content="bot for grepolis" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <Main>
                {/* <Particle /> */}
                <div
                    style={{
                        background: 'url(https://gpit-glps.innogamescdn.com/media/grepo/images/background-grepo-city-building-section.9cab004f.jpg) no-repeat 0px 0px',
                        width: 'auto',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        height: 500,
                        position: 'relative',
                        paddingTop: 100,
                    }}
                >
                    <GrepoScroll />
                    <div style={{ margin: 'auto', textAlign: 'center', marginTop: 10 }}>
                        <h6 style={{ color: 'white' }}> Created by Sau1707 </h6>
                        <div style={{ margin: 'auto', marginTop: 0, width: 'fit-content', display: 'flex', gap: 10 }}>
                            <GrepoButton color="yellow" href={MERGED_STABLE}>
                                Install stable
                            </GrepoButton>
                            <GrepoButton color="red" href={MERGED_DEV}>
                                Install dev
                            </GrepoButton>
                        </div>
                        <h6 style={{ color: 'white' }}>
                            Last update: {date.day} {date.month} {date.year}
                        </h6>
                    </div>
                </div>

                <GrepoHr />

                <ToolGrid style={{ marginBottom: 100 }}>
                    <h4
                        style={{
                            color: 'white',
                            marginBottom: 0,
                            width: '100%',
                            textAlign: 'center',
                        }}
                    >
                        Features
                    </h4>
                    {data.map((e, i) => (
                        <Tool key={e} {...e} />
                    ))}
                </ToolGrid>

                <GrepoHr />
            </Main>

            <footer>
                <div
                    style={{
                        background: '#000 url(//gpit-glps.innogamescdn.com/media/grepo/images/footer-grepo.663f1609.jpg) repeat',
                        width: 'auto',
                        height: 'auto',
                        position: 'relative',
                        paddingTop: 100,
                        color: 'white',
                        textAlign: 'center',
                        padding: 100,
                    }}
                >
                    <h5> Disclaimer </h5>
                    <p style={{ maxWidth: 800, margin: 'auto' }}>
                        This open-source bot is designed for use with Grepolis, a video game developed by InnoGames. However, please note that this bot is not endorsed or approved by InnoGames, and the use of this bot may be against the game's terms of service. We do not encourage or condone the use of this bot to gain an unfair advantage or violate the game's rules. The use of this bot is
                        entirely at your own risk, and we accept no liability for any consequences that may arise from its use. By using this bot, you acknowledge and accept that InnoGames may take action against your account for violating their terms of service. We strongly recommend that you read and understand the game's rules before using this bot. Additionally, this bot is provided as
                        open-source software, and we do not offer any technical support or assistance in its installation, configuration, or use. You are solely responsible for any modifications or customizations you make to the bot's code, and we accept no responsibility for any issues that may arise as a result. By using this bot, you acknowledge and accept these terms and conditions and agree
                        to use it responsibly and in accordance with the applicable laws and regulations.
                    </p>
                </div>
            </footer>
        </>
    );
}
