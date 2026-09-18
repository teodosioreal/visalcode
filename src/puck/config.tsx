import type { Config } from '@puckeditor/core'
import { Header, type HeaderProps } from './blocks/Header'
import { Banner, type BannerProps } from './blocks/Banner'
import { PricingTable, type PricingTableProps } from './blocks/PricingTable'
import { Testimonials, type TestimonialsProps } from './blocks/Testimonials'
import { ProtectedGallery, type ProtectedGalleryProps } from './blocks/ProtectedGallery'
import { Footer, type FooterProps } from './blocks/Footer'
import { Text, type TextProps } from './blocks/Text'
import { ImageBlock, type ImageBlockProps } from './blocks/ImageBlock'
import { ButtonBlock, type ButtonBlockProps } from './blocks/ButtonBlock'
import { Container, type ContainerProps } from './blocks/Container'

export type Props = {
  Header: HeaderProps
  Banner: BannerProps
  PricingTable: PricingTableProps
  Testimonials: TestimonialsProps
  ProtectedGallery: ProtectedGalleryProps
  Footer: FooterProps
  Text: TextProps
  ImageBlock: ImageBlockProps
  ButtonBlock: ButtonBlockProps
  Container: ContainerProps
}

export const config: Config<Props> = {
  categories: {
    estrutura: {
      title: 'Estrutura da página',
      components: ['Header', 'Footer', 'Container'],
    },
    vendas: {
      title: 'Blocos de vendas',
      components: ['Banner', 'PricingTable', 'Testimonials', 'ProtectedGallery'],
    },
    conteudo: {
      title: 'Conteúdo',
      components: ['Text', 'ImageBlock', 'ButtonBlock'],
    },
  },
  components: {
    Header,
    Banner,
    PricingTable,
    Testimonials,
    ProtectedGallery,
    Footer,
    Text,
    ImageBlock,
    ButtonBlock,
    Container,
  },
  root: {
    fields: {
      title: { type: 'text', label: 'Título da página' },
    },
    defaultProps: {
      title: 'Minha página',
    },
    render: ({ children }) => <div className="min-h-screen bg-white">{children}</div>,
  },
}

export default config
