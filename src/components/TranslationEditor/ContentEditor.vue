<template>
<div class="editor">
      <div class="menubar" :class="{show: hasFocus}">

        <q-btn
          icon="las la-bold"
          @click="editor.commands.toggleBold()"
          :flat="!editor?.isActive('bold')"
          color="primary"
          size="sm"
          :disable="!hasFocus"
          round
        />

        <q-btn
          icon="las la-italic"
          @click="editor.commands.toggleItalic()"
          :flat="!editor?.isActive('italic')"
          color="primary"
          size="sm"
          :disable="!hasFocus"
          round
        />

        <q-btn
          icon="las la-strikethrough"
          @click="editor.commands.toggleStrike()"
          :flat="!editor?.isActive('strike')"
          color="primary"
          size="sm"
          :disable="!hasFocus"
          round
        />

        <q-btn
          icon="las la-underline"
          @click="editor.commands.toggleUnderline()"
          :flat="!editor?.isActive('underline')"
          color="primary"
          size="sm"
          :disable="!hasFocus"
          round
        />

        <q-btn
          icon="las la-link"
          @click="setLink"
          :flat="!editor?.isActive('link')"
          color="primary"
          size="sm"
          :disable="!hasFocus"
          round
        />

        <q-btn
          icon="las la-unlink"
          v-if="editor?.isActive('link')"
          @click="editor?.chain().focus().unsetLink().run()"
          :flat="!editor?.isActive('link')"
          color="primary"
          size="sm"
          :disable="!hasFocus"
          round
        />

        <!-- <q-btn
          icon="las la-paragraph"
          @click="editor.commands.setParagraph()"
          :flat="!editor?.isActive('paragraph')"
          color="primary"
          size="sm"
          :disable="!hasFocus"
          round
        /> -->

        <!-- <q-btn
          @click="editor.commands.toggleHeading({ level: 1 })"
          :flat="!editor?.isActive('heading', { level: 1 })"
          color="primary"
          size="sm"
          round
          :disable="!hasFocus"
          label="H1"
        /> -->

        <q-btn
          @click="editor.commands.toggleHeading({ level: 2 })"
          :flat="!editor?.isActive('heading', { level: 2 })"
          color="primary"
          size="sm"
          round
          :disable="!hasFocus"
          label="H2"
        />

        <q-btn
          @click="editor.commands.toggleHeading({ level: 3 })"
          :flat="!editor?.isActive('heading', { level: 3 })"
          color="primary"
          size="sm"
          round
          :disable="!hasFocus"
          label="H3"
        />

        <q-btn
          icon="las la-list-ul"
          @click="editor.commands.toggleBulletList()"
          :flat="!editor?.isActive('bulletList')"
          color="primary"
          size="sm"
          :disable="!hasFocus"
          round
        />

        <q-btn
          icon="las la-list-ol"
          @click="editor.commands.toggleOrderedList()"
          :flat="!editor?.isActive('orderedList')"
          color="primary"
          size="sm"
          :disable="!hasFocus"
          round
        />

        <q-btn
          icon="las la-quote-left"
          @click="editor.commands.toggleBlockquote()"
          :flat="!editor?.isActive('blockquote')"
          color="primary"
          size="sm"
          :disable="!hasFocus"
          round
        />

        <q-btn
          icon="las la-image"
          @click="addImage"
          :flat="!editor?.isActive('image')"
          color="primary"
          size="sm"
          :disable="!hasFocus"
          round
        />

        <q-btn
          icon="las la-ruler-horizontal"
          @click="editor.commands.setHorizontalRule()"
          color="primary"
          size="sm"
          flat
          :disable="!hasFocus"
          round
        />

        <q-btn
          icon="las la-undo"
          @click="editor.commands.undo()"
          color="primary"
          size="sm"
          flat
          :disable="!hasFocus"
          round
        />

        <q-btn
          icon="las la-redo"
          @click="editor.commands.redo()"
          color="primary"
          size="sm"
          flat
          :disable="!hasFocus"
          round
        />

        <!-- <q-btn
          icon="las la-code"
          @click="editor.commands.toggleCode()"
          :flat="!editor?.isActive('code')"
          color="primary"
          size="sm"
          :disable="!hasFocus"
          round
        />

        <q-btn
          icon="las la-laptop-code"
          @click="editor.commands.toggleCodeBlock()"
          :flat="!editor?.isActive('codeBlock')"
          color="primary"
          size="sm"
          :disable="!hasFocus"
          round
        /> -->

      </div>
  <editor-content :editor="editor" />
  <div>
    <get-images path-prefix="media" @cancel="getImagesPrompt = false" @selected="imageSelected" :prompt="getImagesPrompt" />
  </div>
</div>
</template>

<script>
import { watch, ref, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { useI18n } from 'vue-i18n'
import GetImages from './GetImages.vue'
import { Figure } from './figure'

export default {
  components: {
    EditorContent,
    GetImages
  },
  props: {
    modelValue: {
      type: String,
      default: ''
    }
  },
  emits: ['update:modelValue'],
  setup (props, { emit }) {
    const hasFocus = ref(false)
    const i18n = useI18n()
    const getImagesPrompt = ref(false)
    const editor = useEditor({
      content: props.modelValue,
      extensions: [
        StarterKit,
        TextAlign,
        Highlight,
        Underline,
        Link,
        Image,
        Figure,
        Placeholder.configure({
          placeholder: i18n.t('content.placeholder')
        })
      ],
      onUpdate: () => {
        emit('update:modelValue', editor.value.getHTML())
      },
      onFocus (/* { editor, event } */) {
        // The editor is focused.
        hasFocus.value = true
      }
    })

    onBeforeUnmount(() => {
      editor.value.destroy()
    })

    watch(() => props.modelValue,
      (newVal, _) => {
        const isSame = editor.value.getHTML() === newVal
        if (isSame) {
          return
        }
        editor.value.commands.setContent(props.modelValue, false)
      })

    // methods

    const setLink = () => {
      const url = window.prompt('URL')

      editor.value.chain().focus().setLink({ href: url }).run()
    }

    const addImage = () => {
      getImagesPrompt.value = true
    }

    const imageSelected = (img) => {
      if (img.url) {
        if (img.caption) {
          editor
            .value
            .chain()
            .focus()
            .setFigure({ src: img.url, caption: img.caption?.replace(/<[^>]*>?/gm, '') })
            .run()
        } else {
          editor.value.chain().focus().setImage({ src: img.url }).run()
        }

        getImagesPrompt.value = false
      }
    }

    return {
      editor,
      setLink,
      addImage,
      hasFocus,
      getImagesPrompt,
      imageSelected
    }
  }
}
</script>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Karla:wght@400;700&display=swap');
$color-black: rgb(32, 32, 32);
$color-white: white;
$color-grey: rgb(70, 70, 70);
.menubar {
  opacity: 0;
  transition: ease-in-out 0.6s;
}
.show {
  opacity: 1;
  transition: ease-in-out 0.6s;
}
.ProseMirror p.is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    float: left;
    color: #ced4da;
    pointer-events: none;
    height: 0;
}
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
