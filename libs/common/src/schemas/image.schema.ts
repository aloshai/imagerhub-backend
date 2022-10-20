import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ImageDocument = Image & Document;

@Schema()
export class Image {
  @Prop({ required: true })
  uri: string;

  @Prop({ required: true })
  key: string;

  @Prop({ required: true })
  bucket: string;

  @Prop({ required: true })
  size: number;

  @Prop({ required: true })
  contentType: string;
}

export const ImageSchema = SchemaFactory.createForClass(Image);
