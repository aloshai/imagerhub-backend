import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ImageDocument = Image & Document;

@Schema()
export class Image {
  @Prop({ required: true })
  fileName: string;
  
  @Prop({ type: String, required: true })
  contentType: string;
}

export const ImageSchema = SchemaFactory.createForClass(Image);
