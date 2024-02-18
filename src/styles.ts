import {CSSProperties} from "react";
import {rem} from "@mantine/core";


export const iconMStyle: CSSProperties = {
    width: rem(18),
    height: rem(18)
}

export const marginTopBottom: CSSProperties = {
    marginTop: "1em",
    marginBottom: "1em"
}

export const maxWidth: CSSProperties = {
    width: "100%"
}

export const backgroundStyle: CSSProperties = {
    position: "relative",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPositionX: "center",
    backgroundPositionY: "20%",
    objectPosition: 'center 20%'
}

export const backgroundMaskStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(19, 21, 44, 0.15)'
}

export const backgroundFullImgStyle: CSSProperties = {
    backgroundSize: "contain",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat"
}

export const noMargin: CSSProperties = {
    margin: 0
}
