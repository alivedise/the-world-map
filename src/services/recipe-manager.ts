import { ProductRecipe } from '../models/ProductRecipe';
import { BuildingType } from '../models/building-type';
import { defaultRecipes } from '../models/ProductRecipe';
import { CompanyType } from '../models/CompanyType';

export default class RecipeManager {
  private recipes: ProductRecipe[] = [];
  private recipesByProducer: Map<CompanyType, ProductRecipe[]> = new Map();

  constructor(initialRecipes: ProductRecipe[] = defaultRecipes) {
    this.addRecipes(initialRecipes);
  }

  addRecipe(recipe: ProductRecipe) {
    this.recipes.push(recipe);
    
    const producerRecipes = this.recipesByProducer.get(recipe.producerType) || [];
    producerRecipes.push(recipe);
    this.recipesByProducer.set(recipe.producerType, producerRecipes);
  }

  addRecipes(recipes: ProductRecipe[]) {
    recipes.forEach(recipe => this.addRecipe(recipe));
  }

  getRecipesForType(companyType: CompanyType): ProductRecipe[] {
    return this.recipesByProducer.get(companyType) || [];
  }

  getRecipeById(id: string): ProductRecipe | undefined {
    return this.recipes.find(recipe => recipe.id === id);
  }
}