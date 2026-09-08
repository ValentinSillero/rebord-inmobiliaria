import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Property } from './Property';

@Entity({ name: 'property_images' })
@Index('IDX_property_images_property_position', ['propertyId', 'position'])
@Index('UQ_property_images_one_cover_per_property', ['propertyId'], {
  unique: true,
  where: '"is_cover" = true',
})
@Check('CHK_property_images_position_nonnegative', '"position" >= 0')
@Check(
  'CHK_property_images_dimensions_positive',
  '("width" IS NULL OR "width" > 0) AND ("height" IS NULL OR "height" > 0)',
)
export class PropertyImage {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'property_id', type: 'uuid' })
  propertyId!: string;

  @Column({ name: 'secure_url', type: 'varchar', length: 2048 })
  secureUrl!: string;

  @Column({ name: 'public_id', type: 'varchar', length: 255 })
  publicId!: string;

  @Column({ type: 'integer', default: 0 })
  position!: number;

  @Column({ name: 'is_cover', type: 'boolean', default: false })
  isCover!: boolean;

  @Column({ name: 'alt_text', type: 'varchar', length: 255, nullable: true })
  altText!: string | null;

  @Column({ type: 'integer', nullable: true })
  width!: number | null;

  @Column({ type: 'integer', nullable: true })
  height!: number | null;

  @Column({ type: 'varchar', length: 32, nullable: true })
  format!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => Property, (property) => property.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'property_id' })
  property!: Property;
}
