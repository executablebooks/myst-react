/** This is the baseline renderer
 * for converting Markdown to React components via markdown-it.
 * It includes no plugins and renders to basic React primitives
 */

import React, { useContext } from 'react'

import MarkdownIt from 'markdown-it'
import SyntaxHighlighter from 'react-syntax-highlighter'

import SyntaxTreeNode from './tree'

export interface IParseOptions {
  html?: boolean
  xhtmlOut?: boolean
  breaks?: boolean
  langPrefix?: string
  linkify?: boolean
  typographer?: boolean
  quotes?: string | string[]
  highlighting?: boolean
  [key: string]: any
}

export type TPresetName = 'default' | 'zero' | 'commonmark'

export interface IRenderProps {
  node: SyntaxTreeNode
}

export interface childProps {
  index: number
  child: SyntaxTreeNode
}

/** A context from which components can access the MarkdownIt options and env */
const RenderContext = React.createContext<{ options: IParseOptions; env: any }>({
  options: {},
  env: {}
})

/** The principle renderer component */
export default function MarkdownItRenderer(props: {
  source: string
  presetName: TPresetName
  options: IParseOptions
}): JSX.Element {
  const md = new MarkdownIt(props.presetName, props.options || {})
  const env = {}
  const tokens = md.parse(props.source, env)
  const tree = new SyntaxTreeNode(tokens)

  return (
    <RenderContext.Provider value={{ options: props.options, env }}>
      <NodeChildren node={tree} />
    </RenderContext.Provider>
  )
}

MarkdownItRenderer.defaultProps = {
  presetName: 'default',
  options: {}
}

/** mapping of token types to renderers */
export const baseRenderers: {
  [key: string]: (props: childProps) => JSX.Element
} = {
  paragraph: props => <Paragraph key={props.index} node={props.child} />,
  inline: props => <Inline key={props.index} node={props.child} />,
  text: props => <Text key={props.index} node={props.child} />,
  bullet_list: props => <BulletList key={props.index} node={props.child} />,
  ordered_list: props => <OrderedList key={props.index} node={props.child} />,
  list_item: props => <ListItem key={props.index} node={props.child} />,
  em: props => <Em key={props.index} node={props.child} />,
  softbreak: props => <Softbreak key={props.index} />,
  hardbreak: props => <Hardbreak key={props.index} />,
  strong: props => <Strong key={props.index} node={props.child} />,
  blockquote: props => <Blockquote key={props.index} node={props.child} />,
  hr: props => <Hr key={props.index} />,
  code_inline: props => <CodeInline key={props.index} node={props.child} />,
  code_block: props => <CodeBlock key={props.index} node={props.child} />,
  fence: props => <Fence key={props.index} node={props.child} />,
  heading: props => <Heading key={props.index} node={props.child} />,
  link: props => <Link key={props.index} node={props.child} />,
  autolink: props => <Autolink key={props.index} node={props.child} />,
  html_inline: props => <HtmlInline key={props.index} node={props.child} />,
  html_block: props => <HtmlBlock key={props.index} node={props.child} />,
  image: props => <Image key={props.index} node={props.child} />,
  // extended
  s: props => <StrikeThrough key={props.index} node={props.child} />,
  table: props => <Table key={props.index} node={props.child} />,
  thead: props => <TableHead key={props.index} node={props.child} />,
  tbody: props => <TableBody key={props.index} node={props.child} />,
  tr: props => <TableRow key={props.index} node={props.child} />,
  td: props => <TableCell key={props.index} node={props.child} />,
  th: props => <TableHeadCell key={props.index} node={props.child} />
}

/** Component to render children of a node */
function NodeChildren({ node }: { node: SyntaxTreeNode }): JSX.Element {
  const renderers = baseRenderers
  const rendered: JSX.Element[] = []
  for (let index = 0; index < node.children.length; index++) {
    const child = node.children[index]
    console.log(child.type, child.hidden)
    // if (child.hidden) {
    //   // Tight list paragraphs
    if (!(child.type in renderers)) {
      console.error(`no render component for type ${child.type}`)
    } else {
      rendered.push(renderers[child.type]({ index, child }))
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

function Softbreak(): JSX.Element {
  const context = useContext(RenderContext)
  if (context.options?.breaks) {
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
  const context = useContext(RenderContext)
  if (!context.options.highlighting || !props.node.info.trim()) {
    return (
      <pre>
        <code>{props.node.content}</code>
      </pre>
    )
  }
  const info = props.node.info.trim().split(' ', 1)
  const langName = info[0]
  // TODO this is not performant for large file:
  // https://github.com/react-syntax-highlighter/react-syntax-highlighter/issues/302
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
