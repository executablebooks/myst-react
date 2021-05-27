import React from 'react'

import SyntaxHighlighter from 'react-syntax-highlighter'

import MarkdownIt from 'markdown-it'

import SyntaxTreeNode from './tree'

export interface IParseOptions {
  html?: boolean
  xhtmlOut?: boolean
  breaks?: boolean
  langPrefix?: string
  linkify?: boolean
  typographer?: boolean
  quotes?: string | string[]
  highlight?: ((str: string, lang: string, attrs: string) => string) | null
  [key: string]: any
}

export interface IRenderProps {
  node: SyntaxTreeNode
  options?: IParseOptions
  env?: any
}

export default function MarkdownItRenderer(props: {
  source: string
  options?: IParseOptions
}): JSX.Element {
  const md = new MarkdownIt(props.options || {})
  const env = {}
  const tokens = md.parse(props.source, env)
  const tree = new SyntaxTreeNode(tokens)
  return <NodeChildren node={tree} options={props.options} env={env} />
}

function NodeChildren(props: IRenderProps): JSX.Element {
  const rendered: JSX.Element[] = []
  for (let index = 0; index < props.node.children.length; index++) {
    const child = props.node.children[index]
    if (child.hidden) {
      // Tight list paragraphs
      continue
    }
    switch (child.type) {
      // Commonmark tokens
      case 'paragraph':
        rendered.push(<Paragraph key={index} node={child} />)
        break
      case 'inline':
        rendered.push(<Inline key={index} node={child} />)
        break
      case 'text':
        rendered.push(<Text key={index} node={child} />)
        break
      case 'bullet_list':
        rendered.push(<BulletList key={index} node={child} />)
        break
      case 'ordered_list':
        rendered.push(<OrderedList key={index} node={child} />)
        break
      case 'list_item':
        rendered.push(<ListItem key={index} node={child} />)
        break
      case 'em':
        rendered.push(<Em key={index} node={child} />)
        break
      case 'softbreak':
        rendered.push(<Softbreak key={index} node={child} options={props.options} />)
        break
      case 'hardbreak':
        rendered.push(<Hardbreak key={index} />)
        break
      case 'strong':
        rendered.push(<Strong key={index} node={child} />)
        break
      case 'blockquote':
        rendered.push(<Blockquote key={index} node={child} />)
        break
      case 'hr':
        rendered.push(<Hr key={index} />)
        break
      case 'code_inline':
        rendered.push(<CodeInline key={index} node={child} />)
        break
      case 'code_block':
        rendered.push(<CodeBlock key={index} node={child} />)
        break
      case 'fence':
        rendered.push(<Fence key={index} node={child} />)
        break
      case 'heading':
        rendered.push(<Heading key={index} node={child} />)
        break
      case 'link':
        rendered.push(<Link key={index} node={child} />)
        break
      case 'autolink':
        rendered.push(<Autolink key={index} node={child} />)
        break
      case 'html_inline':
        rendered.push(<HtmlInline key={index} node={child} />)
        break
      case 'html_block':
        rendered.push(<HtmlBlock key={index} node={child} />)
        break
      case 'image':
        rendered.push(<Image key={index} node={child} />)
        break
      // extended
      case 's':
        rendered.push(<StrikeThrough key={index} node={child} />)
        break
      case 'table':
        rendered.push(<Table key={index} node={child} />)
        break
      case 'thead':
        rendered.push(<TableHead key={index} node={child} />)
        break
      case 'tbody':
        rendered.push(<TableBody key={index} node={child} />)
        break
      case 'tr':
        rendered.push(<TableRow key={index} node={child} />)
        break
      case 'td':
        rendered.push(<TableCell key={index} node={child} />)
        break
      case 'th':
        rendered.push(<TableHeadCell key={index} node={child} />)
        break
      default:
        console.error(`no render component for type ${child.type}`)
    }
  }
  return <>{rendered}</>
}

function Paragraph(props: IRenderProps): JSX.Element {
  return (
    <p>
      <NodeChildren node={props.node} />
    </p>
  )
}

function Inline(props: IRenderProps): JSX.Element {
  return (
    <>
      <NodeChildren node={props.node} />
    </>
  )
}

function Text(props: IRenderProps): JSX.Element {
  return <>{props.node.content}</>
}

function BulletList(props: IRenderProps): JSX.Element {
  return (
    <ul>
      <NodeChildren node={props.node} />
    </ul>
  )
}

function OrderedList(props: IRenderProps): JSX.Element {
  return (
    <ol start={props.node.attrs.start as number | undefined}>
      <NodeChildren node={props.node} />
    </ol>
  )
}

function ListItem(props: IRenderProps): JSX.Element {
  return (
    <li>
      <NodeChildren node={props.node} />
    </li>
  )
}

function Em(props: IRenderProps): JSX.Element {
  return (
    <em>
      <NodeChildren node={props.node} />
    </em>
  )
}

function Softbreak(props: IRenderProps): JSX.Element {
  if (props.options?.breaks) {
    return <br />
  }
  return <>{'\n'}</>
}

function Hardbreak(): JSX.Element {
  return <br />
}

function Strong(props: IRenderProps): JSX.Element {
  return (
    <strong>
      <NodeChildren node={props.node} />
    </strong>
  )
}
function Blockquote(props: IRenderProps): JSX.Element {
  return (
    <blockquote>
      <NodeChildren node={props.node} />
    </blockquote>
  )
}
function Hr(): JSX.Element {
  return <hr />
}
function CodeInline(props: IRenderProps): JSX.Element {
  return <code>{props.node.content}</code>
}
function CodeBlock(props: IRenderProps): JSX.Element {
  return (
    <pre>
      <code>{props.node.content}</code>
    </pre>
  )
}
function Fence(props: IRenderProps): JSX.Element {
  if (!props.node.info.trim()) {
    return (
      <pre>
        <code>{props.node.content}</code>
      </pre>
    )
  }
  const info = props.node.info.trim().split(' ', 1)
  const langName = info[0]
  return <SyntaxHighlighter language={langName}>{props.node.content}</SyntaxHighlighter>
}
function Heading(props: IRenderProps): JSX.Element {
  switch (props.node.tag) {
    case 'h1':
      return (
        <h1>
          <NodeChildren node={props.node} />
        </h1>
      )
    case 'h2':
      return (
        <h2>
          <NodeChildren node={props.node} />
        </h2>
      )
    case 'h3':
      return (
        <h3>
          <NodeChildren node={props.node} />
        </h3>
      )
    case 'h4':
      return (
        <h4>
          <NodeChildren node={props.node} />
        </h4>
      )
    case 'h5':
      return (
        <h5>
          <NodeChildren node={props.node} />
        </h5>
      )
    case 'h6':
      return (
        <h6>
          <NodeChildren node={props.node} />
        </h6>
      )
    default:
      console.error(`unexpected tag: ${props.node.tag}`)
  }
  return <></>
}
function Link(props: IRenderProps): JSX.Element {
  return (
    <a href={props.node.attrs.href ? `${props.node.attrs.href}` : undefined}>
      <NodeChildren node={props.node} />
    </a>
  )
}
function Autolink(props: IRenderProps): JSX.Element {
  return (
    <a href={props.node.attrs.href ? `${props.node.attrs.href}` : undefined}>
      <NodeChildren node={props.node} />
    </a>
  )
}
function HtmlInline(props: IRenderProps): JSX.Element {
  // TODO weirdly here it is splitting e.g. <em>a</em> into html+text+html
  // it doesn't do this for block HTML
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: `<${props.node.tag}>${props.node.content}</${props.node.tag}>`
      }}
    />
  )
}
function HtmlBlock(props: IRenderProps): JSX.Element {
  // TODO see HtmlInline
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: `<${props.node.tag}>${props.node.content}</${props.node.tag}>`
      }}
    />
  )
}
function Image(props: IRenderProps): JSX.Element {
  return (
    <img
      alt={props.node.content}
      src={props.node.attrs.src ? `${props.node.attrs.src}` : undefined}
    />
  )
}
function StrikeThrough(props: IRenderProps): JSX.Element {
  return (
    <s>
      <NodeChildren node={props.node} />
    </s>
  )
}
function Table(props: IRenderProps): JSX.Element {
  return (
    <table>
      <NodeChildren node={props.node} />
    </table>
  )
}
function TableHead(props: IRenderProps): JSX.Element {
  return (
    <thead>
      <NodeChildren node={props.node} />
    </thead>
  )
}
function TableBody(props: IRenderProps): JSX.Element {
  return (
    <tbody>
      <NodeChildren node={props.node} />
    </tbody>
  )
}
function TableRow(props: IRenderProps): JSX.Element {
  return (
    <tr>
      <NodeChildren node={props.node} />
    </tr>
  )
}
function TableCell(props: IRenderProps): JSX.Element {
  const style: { textAlign?: 'center' | 'left' | 'right' } = {}
  if (typeof props.node.attrs.style === 'string') {
    if (props.node.attrs.style.endsWith('center')) {
      style.textAlign = 'center'
    } else if (props.node.attrs.style.endsWith('left')) {
      style.textAlign = 'left'
    } else if (props.node.attrs.style.endsWith('right')) {
      style.textAlign = 'right'
    }
  }
  return (
    <td style={style}>
      <NodeChildren node={props.node} />
    </td>
  )
}
function TableHeadCell(props: IRenderProps): JSX.Element {
  const style = {}
  if (props.node.attrs.style) {
  }
  return (
    <th style={style}>
      <NodeChildren node={props.node} />
    </th>
  )
}
