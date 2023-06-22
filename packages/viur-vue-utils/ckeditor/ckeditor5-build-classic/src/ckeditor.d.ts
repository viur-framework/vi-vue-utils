/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
import ClassicEditorBase from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { UploadAdapter } from '@ckeditor/ckeditor5-adapter-ckfinder';
import { Bold, Italic, Underline } from '@ckeditor/ckeditor5-basic-styles';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { EasyImage } from '@ckeditor/ckeditor5-easy-image';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Image, ImageResizeButtons, ImageStyle, ImageToolbar, ImageUpload } from '@ckeditor/ckeditor5-image';
import { Indent, IndentBlock } from '@ckeditor/ckeditor5-indent';
import { Link } from '@ckeditor/ckeditor5-link';
import { List } from '@ckeditor/ckeditor5-list';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Table, TableToolbar } from '@ckeditor/ckeditor5-table';
import { TextTransformation } from '@ckeditor/ckeditor5-typing';
import { CloudServices } from '@ckeditor/ckeditor5-cloud-services';
import { Alignment } from '@ckeditor/ckeditor5-alignment';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';
import { RemoveFormat } from '@ckeditor/ckeditor5-remove-format';
import { ViURUploadAdapterPlugin } from '../../viur/viur-upload-adapter';
import 'ckeditor.css';

export default class ClassicEditor extends ClassicEditorBase {
    static builtinPlugins: (typeof TextTransformation | typeof Essentials | typeof UploadAdapter | typeof Paragraph | typeof Heading | typeof Bold | typeof Italic | typeof Underline | typeof BlockQuote | typeof CloudServices | typeof Image | typeof ImageStyle | typeof ImageToolbar | typeof ImageUpload | typeof EasyImage | typeof Indent | typeof IndentBlock | typeof Link | typeof List | typeof Table | typeof TableToolbar | typeof Alignment | typeof SourceEditing | typeof RemoveFormat | typeof ImageResizeButtons)[];
    static defaultConfig: {
        extraPlugins: (typeof ViURUploadAdapterPlugin)[];
        toolbar: {
            items: string[];
        };
        image: {
            toolbar: string[];
            resizeOptions: ({
                name: string;
                value: null;
                icon: string;
            } | {
                name: string;
                value: string;
                icon: string;
            })[];
        };
        table: {
            contentToolbar: string[];
        };
        heading: {
            options: ({
                model: string;
                title: string;
                class: string;
                view?: undefined;
            } | {
                model: string;
                view: string;
                title: string;
                class: string;
            })[];
        };
        alignment: {
            options: {
                name: string;
                className: string;
            }[];
        };
        indentBlock: {
            classes: string[];
        };
        language: string;
        viur_api_url: string;
    };
}
