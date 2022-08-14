/* should revisit this page : https://docs.lens.xyz/docs/metadata-standards */
type MimeType =
    "image/gif" //image 
    | "image/jpeg"
    | "image/png"
    | "image/tiff"
    | "image/x-ms-bmp"
    | "image/svg+xml"
    | "image/webp"
    | "video/webm" //video
    | "video/mp4"
    | "video/x-m4v"
    | "video/ogv"
    | "video/ogg"
    | "audio/wav" //audio
    | "audio/mpeg"
    | "audio/ogg"

interface PublicationMetadataMedia {
    item: string; //Url
    /**
     * This is the mime type of media
     */
    type: MimeType;
}

enum PublicationMetadataVersions {
    one = '1.0.0',
    // please use metadata v2 when doing anything! v1 is supported but discontinued.
    two = '2.0.0'
}

enum PublicationMetadataDisplayType {
    number = 'number',
    string = 'string',
    date = 'date',
}

interface PublicationMetadataAttribute {
    displayType?: PublicationMetadataDisplayType
    traitType?: string;
    value: string;
}

enum PublicationContentWarning {
    NSFW = 'NSFW',
    SENSITIVE = 'SENSITIVE',
    SPOILER = 'SPOILER',
}

export enum PublicationMainFocus {
    VIDEO = 'VIDEO',
    IMAGE = 'IMAGE',
    ARTICLE = 'ARTICLE',
    TEXT_ONLY = 'TEXT_ONLY',
    AUDIO = 'AUDIO',
    LINK = 'LINK',
    EMBED = 'EMBED',
}
export interface PublicationMetadata {
    version: "1.0.0" | "2.0.0";
    metadata_id: string;
    description: string;
    content: string;
    locale?: string;
    tags?: string[];
    contentWarning?: PublicationContentWarning;
    mainContentFocus: PublicationMainFocus;
    external_url?: string; //Url
    name: string;
    attributes: PublicationMetadataAttribute[];
    image?: string; //Url
    imageMimeType?: MimeType;
    media?: PublicationMetadataMedia[];
    animation_url?: string;
    appId?: string;
    createdAt?: Date;
}