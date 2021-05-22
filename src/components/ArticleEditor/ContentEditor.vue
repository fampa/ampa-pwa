<template>
  <div class="editor">
    <editor-menu-bar :editor="editor" v-slot="{ commands, isActive, getMarkAttrs}">
      <div class="menubar">

        <q-btn
          icon="las la-bold"
          @click="commands.bold"
          :flat="!isActive.bold()"
          color="primary"
          size="sm"
          round
        />

        <q-btn
          icon="las la-italic"
          @click="commands.italic"
          :flat="!isActive.italic()"
          color="primary"
          size="sm"
          round
        />

        <q-btn
          icon="las la-strikethrough"
          @click="commands.strike"
          :flat="!isActive.strike()"
          color="primary"
          size="sm"
          round
        />

        <q-btn
          icon="las la-underline"
          @click="commands.underline"
          :flat="!isActive.underline()"
          color="primary"
          size="sm"
          round
        />

        <q-btn
          icon="las la-link"
          @click="openLinkModal(commands.link, getMarkAttrs('link'))"
          :flat="!isActive.link()"
          color="primary"
          size="sm"
          round
        />

        <q-btn
          icon="las la-code"
          @click="commands.code"
          :flat="!isActive.code()"
          color="primary"
          size="sm"
          round
        />

        <q-btn
          icon="las la-paragraph"
          @click="commands.paragraph"
          :flat="!isActive.paragraph()"
          color="primary"
          size="sm"
          round
        />

        <q-btn
          @click="commands.heading({ level: 1 })"
          :flat="!isActive.heading({ level: 1 })"
          color="primary"
          size="sm"
          round
          label="H1"
        />

        <q-btn
          @click="commands.heading({ level: 2 })"
          :flat="!isActive.heading({ level: 2 })"
          color="primary"
          size="sm"
          round
          label="H2"
        />

        <q-btn
          @click="commands.heading({ level: 3 })"
          :flat="!isActive.heading({ level: 3 })"
          color="primary"
          size="sm"
          round
          label="H3"
        />

        <q-btn
          icon="las la-list-ul"
          @click="commands.bullet_list"
          :flat="!isActive.bullet_list()"
          color="primary"
          size="sm"
          round
        />

        <q-btn
          icon="las la-list-ol"
          @click="commands.ordered_list"
          :flat="!isActive.ordered_list()"
          color="primary"
          size="sm"
          round
        />

        <q-btn
          icon="las la-quote-left"
          @click="commands.blockquote"
          :flat="!isActive.blockquote()"
          color="primary"
          size="sm"
          round
        />

        <q-btn
          icon="las la-laptop-code"
          @click="commands.code_block"
          :flat="!isActive.code_block()"
          color="primary"
          size="sm"
          round
        />

        <q-btn
          icon="las la-image"
          @click="openModal(commands.image)"
          :flat="!isActive.image()"
          color="primary"
          size="sm"
          round
        />

        <q-btn
          icon="las la-ruler-horizontal"
          @click="commands.horizontal_rule"
          color="primary"
          size="sm"
          flat
          round
        />

        <q-btn
          icon="las la-undo"
          @click="commands.undo"
          color="primary"
          size="sm"
          flat
          round
        />

        <q-btn
          icon="las la-redo"
          @click="commands.redo"
          color="primary"
          size="sm"
          flat
          round
        />

      </div>
    </editor-menu-bar>
    <link-modal ref="linkModal" @command="linkSelected" @cancel="linkPrompt = false" :link="linkUrl" :prompt="linkPrompt" />
    <get-images ref="ytmodal" @cancel="getImagesPrompt = false" @command="imageSelected" :prompt="getImagesPrompt" />

    <editor-content :editor="editor" />
  </div>
</template>

<script>
import { Editor, EditorContent, EditorMenuBar } from 'tiptap'
import GetImages from './GetImages'
import LinkModal from './LinkModal'

import {
  Blockquote,
  CodeBlock,
  HardBreak,
  Heading,
  HorizontalRule,
  OrderedList,
  BulletList,
  ListItem,
  TodoItem,
  TodoList,
  Bold,
  Code,
  Italic,
  Link,
  Strike,
  Underline,
  History,
  Placeholder,
  Image
} from 'tiptap-extensions'
export default {
  components: {
    EditorContent,
    EditorMenuBar,
    GetImages,
    LinkModal
  },
  props: ['value'],
  mounted () {
    this.editor = new Editor({
      extensions: [
        new Blockquote(),
        new BulletList(),
        new CodeBlock(),
        new HardBreak(),
        new Heading({ levels: [1, 2, 3] }),
        new HorizontalRule(),
        new ListItem(),
        new OrderedList(),
        new TodoItem(),
        new TodoList(),
        new Link(),
        new Bold(),
        new Code(),
        new Italic(),
        new Strike(),
        new Underline(),
        new History(),
        new Image(),
        new Placeholder({ emptyNodeText: this.$t('placeholder') })
      ],
      content: this.value,
      onUpdate: ({ getHTML }) => {
        this.emitAfterOnUpdate = true
        this.$emit('input', getHTML())
      }
    })
    this.editor.setContent(this.value)
  },
  watch: {
    value (val) {
      if (this.emitAfterOnUpdate) {
        this.emitAfterOnUpdate = false
        return
      }
      if (this.editor) this.editor.setContent(val)
    }
  },
  data () {
    return {
      editor: null,
      emitAfterOnUpdate: false,
      getImagesPrompt: false,
      linkPrompt: false,
      linkMenuIsActive: false,
      linkUrl: null
    }
  },
  methods: {
    openModal (command) {
      this.$refs.ytmodal.setCommand(command)
      this.getImagesPrompt = true
    },
    openLinkModal (command, url) {
      this.$refs.linkModal.setCommand(command, url)
      this.linkPrompt = true
    },
    linkSelected (obj) {
      const data = {
        command: obj.command,
        data: {
          href: obj.href
        }
      }
      if (data.command !== null) {
        data.command(data.data)
      }
      this.linkPrompt = false
    },
    imageSelected (obj) {
      const data = {
        command: obj.command,
        data: {
          src: obj.image
          // alt: "YOU CAN ADD ALT",
          // title: "YOU CAN ADD TITLE"
        }
      }
      if (data.command !== null) {
        data.command(data.data)
      }
      this.getImagesPrompt = false
    }
  },
  beforeUnmount () {
    if (this.editor) this.editor.destroy()
  }
}
</script>
<i18n>
{
  "ca": {
    "placeholder": "Escriu alguna cosa ací..."
  },
  "es": {
    "placeholder": "Escribe algo aquí..."
  }
}
</i18n>
<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Karla:wght@400;700&display=swap');
$color-black: rgb(32, 32, 32);
$color-white: white;
$color-grey: rgb(70, 70, 70);

.ProseMirror{
  min-height: 300px;
  padding: 1rem;

  blockquote {
    background-color: #f5f5f5;
    border-left: 5px solid #dbdbdb;
    padding: 1.25em 1.5em;
  }

  font-family: 'Karla', sans-serif;
  position: relative;
  // max-width: 800px;
  // margin: 0 auto 5rem auto;
  font-size: 1.1rem;
  line-height: 1.2;

    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-word;

    * {
      caret-color: currentColor;
    }

    pre {
      padding: 0.7rem 1rem;
      border-radius: 5px;
      background: $color-black;
      color: $color-white;
      font-size: 0.8rem;
      overflow-x: auto;

      code {
        display: block;
      }
    }

    p code {
      padding: 0.2rem 0.4rem;
      border-radius: 5px;
      font-size: 0.8rem;
      font-weight: bold;
      background: rgba($color-black, 0.1);
      color: rgba($color-black, 0.8);
    }

    ul,
    ol {
      padding-left: 1rem;
    }

    li > p,
    li > ol,
    li > ul {
      margin: 0;
    }

    a {
      color: $primary;
      text-decoration: none;
    }

    img {
      max-width: 100%;
      border-radius: 3px;
    }

    table {
      border-collapse: collapse;
      table-layout: fixed;
      width: 100%;
      margin: 0;
      overflow: hidden;

      td, th {
        min-width: 1em;
        border: 2px solid $color-grey;
        padding: 3px 5px;
        vertical-align: top;
        box-sizing: border-box;
        position: relative;
        > * {
          margin-bottom: 0;
        }
      }

      th {
        font-weight: bold;
        text-align: left;
      }

      .selectedCell:after {
        z-index: 2;
        position: absolute;
        content: "";
        left: 0; right: 0; top: 0; bottom: 0;
        background: rgba(200, 200, 255, 0.4);
        pointer-events: none;
      }

      .column-resize-handle {
        position: absolute;
        right: -2px; top: 0; bottom: 0;
        width: 4px;
        z-index: 20;
        background-color: #adf;
        pointer-events: none;
      }
    }

    .tableWrapper {
      margin: 1em 0;
      overflow-x: auto;
    }

    .resize-cursor {
      cursor: ew-resize;
      cursor: col-resize;
    }

  }

p.is-empty:first-child::before {
  content: attr(data-empty-text);
  float: left;
  color: lightgray;
  pointer-events: none;
  height: 0;
}

</style>
