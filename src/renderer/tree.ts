/**
 * Ported from https://github.com/executablebooks/markdown-it-py/blob/master/markdown_it/tree.py
 */
import { AssertionError } from 'assert'

import Token from 'markdown-it/lib/token'

interface _NesterTokens {
  opening: Token
  closing: Token
}

/** A Markdown syntax tree node.

A class that can be used to construct a tree representation of a linear
`markdown-it` token stream.

Each node in the tree represents either:
  - root of the Markdown document
  - a single unnested `Token`
  - a `Token` "_open" and "_close" token pair, and the tokens nested in
      between
*/
export default class SyntaxTreeNode {
  private token: null | Token = null
  private nester_tokens: null | _NesterTokens = null
  public parent: null | SyntaxTreeNode = null
  public children: SyntaxTreeNode[] = []

  constructor(tokens: Token[], create_root = true) {
    tokens = [...tokens]
    if (create_root) {
      this._set_children_from_tokens(tokens)
      return
    }

    if (tokens.length === 0) {
      throw new AssertionError({
        message:
          'Can only create root from empty token sequence. Set `create_root=True`.'
      })
    }

    if (tokens.length === 1) {
      const inline_token = tokens[0]
      if (inline_token.nesting) {
        throw new AssertionError({
          message: 'Unequal nesting level at the start and end of token stream.'
        })
      }
      this.token = inline_token
      if (inline_token.children) {
        this._set_children_from_tokens(inline_token.children)
      }
    } else {
      this.nester_tokens = { opening: tokens[0], closing: tokens[tokens.length - 1] }
      this._set_children_from_tokens(tokens.slice(1, tokens.length - 1))
    }
  }

  /** Convert the token stream to a tree structure and set the resulting
      nodes as children of `self`. 
  */
  _set_children_from_tokens(tokens: Token[]): void {
    const reversed_tokens = tokens.reverse()

    while (reversed_tokens.length !== 0) {
      let token = reversed_tokens.pop() as Token

      if (!token.nesting) {
        this._add_child([token])
        continue
      }
      if (token.nesting !== 1) {
        throw new AssertionError({ message: 'Invalid token nesting' })
      }

      const nested_tokens = [token]
      let nesting = 1
      while (reversed_tokens.length && nesting) {
        token = reversed_tokens.pop() as Token
        nested_tokens.push(token)
        nesting += token.nesting
      }
      if (nesting) {
        throw new AssertionError({
          message: `unclosed tokens starting ${nested_tokens[0]}`
        })
      }

      this._add_child(nested_tokens)
    }
  }

  /** Make a child node for instance */
  _add_child(tokens: Token[]): void {
    const child = new SyntaxTreeNode(tokens, false)
    child.parent = this
    this.children.push(child)
  }

  /** Return the `Token` that is used as the data source for the
  properties defined below. */
  _attribute_token(): Token {
    if (this.token) {
      return this.token
    }
    if (this.nester_tokens) {
      return this.nester_tokens.opening
    }
    throw new AssertionError({
      message: 'Root node does not have the accessed attribute'
    })
  }

  /** Recursively yield all descendant nodes in the tree starting at self.

  The order mimics the order of the underlying linear token
  stream (i.e. depth first).
  */
  *walk(include_self = true): Generator<SyntaxTreeNode> {
    if (include_self) {
      yield this
    }
    for (const child of this.children) {
      let subchild
      const subchildren = child.walk(true)
      while (!(subchild = subchildren.next()).done) {
        yield subchild.value
      }
    }
  }

  public get type(): string {
    if (this.token !== null) {
      return this.token.type
    }
    if (this.nester_tokens !== null) {
      return this.nester_tokens.opening.type.replace(/_open$/, '')
    }
    return 'root'
  }

  /** Get a string type of the represented syntax.

    - "root" for root nodes
    - `Token.type` if the node represents an unnested token
    - `Token.type` of the opening token, with "_open" suffix stripped, 
      if the node represents a nester token pair
  */
  public get tag(): string {
    /**html tag name, e.g. \"p\ */
    return this._attribute_token().tag
  }

  /** Html attributes. */
  public get attrs(): { [key: string]: string | number } {
    const attrs = this._attribute_token().attrs
    if (!attrs) {
      return {}
    }
    return attrs.reduce((prev, [key, value]) => {
      prev[key] = value
      return prev
    }, {} as { [key: string]: string })
  }

  /** Source map info. Format: `Tuple[ line_begin, line_end ]` */
  public get map(): null | [number, number] {
    return this._attribute_token().map
  }

  /** nesting level, the same as `state.level` */
  public get level(): number {
    return this._attribute_token().level
  }

  /** In a case of self-closing tag (code, html, fence, etc.), it
    has contents of this tag. */
  public get content(): string {
    return this._attribute_token().content
  }

  /** '*' or '_' for emphasis, fence string for fence, etc. */
  public get markup(): string {
    return this._attribute_token().markup
  }

  public get info(): string {
    /**fence infostring */
    return this._attribute_token().info
  }

  /** A place for plugins to store an arbitrary data. */
  public get meta(): any {
    return this._attribute_token().meta
  }

  /** True for block-level tokens, false for inline tokens. */
  public get block(): boolean {
    return this._attribute_token().block
  }

  /** If it's true, ignore this element when rendering.
    Used for tight lists to hide paragraphs. */
  public get hidden(): boolean {
    return this._attribute_token().hidden
  }
}
