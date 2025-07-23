import {CustomEmbedDefinition, DEFAULT_EMBED_DEFINITIONS, DefaultEmbedDefinitionType,} from 'tldraw'
import 'tldraw/tldraw.css'

const defaultEmbedTypesToKeep: DefaultEmbedDefinitionType[] = ['tldraw', 'youtube']
const defaultEmbedsToKeep = DEFAULT_EMBED_DEFINITIONS.filter((embed) =>
    defaultEmbedTypesToKeep.includes(embed.type)
)

const customEmbed: CustomEmbedDefinition = {
    type: 'scryfall',
    title: 'Scryfall',
    hostnames: ['scryfall.com'],
    width: 672,
    height: 936,
    doesResize: false,
    toEmbedUrl: (url) => {
        const urlObj = new URL(url)
        //const matches = urlObj.pathname.match(/\/([^/]+)\/([^/]+)\/(\d+)\/embedded/)
        return `https://cards.scryfall.io/large/front/4/0/400862ac-f229-4f73-949c-779f6bfa868b.jpg?1673149285`
    },
    fromEmbedUrl: (url) => {
        const urlObj = new URL(url)
        /*        const matches = urlObj.pathname.match(/\/([^/]+)\/([^/]+)\/(\d+)\/embedded/)
                if (matches) {
                    return `https://jsfiddle.net/${matches[1]}/${matches[2]}/`
                }*/
        return "https://cards.scryfall.io/large/front/4/0/400862ac-f229-4f73-949c-779f6bfa868b.jpg?1673149285"
    },
    icon: 'https://scryfall.com/favicon.ico?v=ea3a11dc88e7',
}
export const embeds = [...defaultEmbedsToKeep, customEmbed]