import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ImageDocument = Image & Document;

@Schema()
export class Image {
  @Prop({ required: true, type: String })
  uri: string;

  @Prop({ required: true, type: String })
  key: string;

  @Prop({ required: true, type: String })
  bucket: string;

  @Prop({ required: true, type: Number })
  size: number;

  @Prop({ required: true, type: String })
  contentType: string;

  @Prop({ required: true, type: String })
  name: string;

  @Prop({ type: String, maxlength: 1024 })
  alt?: string;

  @Prop({ default: [], type: Types.Array<String> })
  tags: []
}

export const ImageSchema = SchemaFactory.createForClass(Image);
