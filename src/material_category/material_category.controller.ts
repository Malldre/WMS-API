import { Controller, Post, Body, ConflictException } from '@nestjs/common';
import { MaterialCategoryService } from './material_category.service'
import { MaterialUnitEnum } from './material_category.entity';

@Controller('users')
export class MaterialCategoryController {
  constructor(private materialCategory: MaterialCategoryService) {}

  @Post('register')
  async register(@Body() body: { name: string; description: string; materialUnit: MaterialUnitEnum }) {
    const { name, description, materialUnit } = body;

    const existingUser = await this.materialCategory.findOne(name);
    if (existingUser) {
      throw new ConflictException('Category already exists');
    }

    const user = await this.materialCategory.createMaterialCategory(name, description, materialUnit);

    return {
      id: user.uuid,
      username: user.name,
      message: 'Material Category created successfully',
    };
  }
}
