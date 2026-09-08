import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { numericTransformer } from '@/db/transformers/numeric';
import { PropertyFeature } from './PropertyFeature';
import { PropertyImage } from './PropertyImage';
import {
  PropertyCurrency,
  PropertyOperation,
  PropertyStatus,
  PropertyType,
} from './property-enums';

@Entity({ name: 'properties' })
@Index('IDX_properties_operation', ['operation'])
@Index('IDX_properties_status', ['status'])
@Index('IDX_properties_city', ['city'])
@Index('IDX_properties_featured_true', ['featured'], { where: '"featured" = true' })
@Index('IDX_properties_published_true', ['published'], { where: '"published" = true' })
@Check('CHK_properties_price_nonnegative', '"price" >= 0')
@Check('CHK_properties_latitude_range', '"latitude" IS NULL OR "latitude" BETWEEN -90 AND 90')
@Check('CHK_properties_longitude_range', '"longitude" IS NULL OR "longitude" BETWEEN -180 AND 180')
@Check(
  'CHK_properties_counts_nonnegative',
  '("rooms" IS NULL OR "rooms" >= 0) AND ("bedrooms" IS NULL OR "bedrooms" >= 0) AND ("bathrooms" IS NULL OR "bathrooms" >= 0) AND ("garage" IS NULL OR "garage" >= 0)',
)
@Check(
  'CHK_properties_areas_nonnegative',
  '("total_area" IS NULL OR "total_area" >= 0) AND ("covered_area" IS NULL OR "covered_area" >= 0)',
)
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'varchar', length: 220, unique: true })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({
    name: 'property_type',
    type: 'enum',
    enum: PropertyType,
    enumName: 'property_type_enum',
  })
  propertyType!: PropertyType;

  @Column({
    type: 'enum',
    enum: PropertyOperation,
    enumName: 'property_operation_enum',
  })
  operation!: PropertyOperation;

  @Column({
    type: 'enum',
    enum: PropertyStatus,
    enumName: 'property_status_enum',
    default: PropertyStatus.Available,
  })
  status!: PropertyStatus;

  @Column({ type: 'numeric', precision: 15, scale: 2, transformer: numericTransformer })
  price!: number;

  @Column({
    type: 'enum',
    enum: PropertyCurrency,
    enumName: 'property_currency_enum',
  })
  currency!: PropertyCurrency;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address!: string | null;

  @Column({ type: 'varchar', length: 120 })
  city!: string;

  @Column({ type: 'varchar', length: 120 })
  province!: string;

  @Column({ name: 'postal_code', type: 'varchar', length: 20, nullable: true })
  postalCode!: string | null;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 7,
    nullable: true,
    transformer: numericTransformer,
  })
  latitude!: number | null;

  @Column({
    type: 'numeric',
    precision: 10,
    scale: 7,
    nullable: true,
    transformer: numericTransformer,
  })
  longitude!: number | null;

  @Column({ name: 'hide_exact_address', type: 'boolean', default: false })
  hideExactAddress!: boolean;

  @Column({ type: 'integer', nullable: true })
  rooms!: number | null;

  @Column({ type: 'integer', nullable: true })
  bedrooms!: number | null;

  @Column({ type: 'integer', nullable: true })
  bathrooms!: number | null;

  @Column({ type: 'integer', nullable: true })
  garage!: number | null;

  @Column({
    name: 'total_area',
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: numericTransformer,
  })
  totalArea!: number | null;

  @Column({
    name: 'covered_area',
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: true,
    transformer: numericTransformer,
  })
  coveredArea!: number | null;

  @Column({ type: 'boolean', default: false })
  featured!: boolean;

  @Column({ type: 'boolean', default: false })
  published!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => PropertyImage, (image) => image.property)
  images!: PropertyImage[];

  @OneToMany(() => PropertyFeature, (feature) => feature.property)
  features!: PropertyFeature[];
}
