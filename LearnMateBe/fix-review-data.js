const mongoose = require('mongoose');
const Review = require('./src/modal/Review');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/LearnMate', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixReviewData() {
  try {
    console.log('Starting to fix review data...');
    
    // Get all reviews
    const reviews = await Review.find({});
    console.log(`Found ${reviews.length} reviews`);
    
    let updatedCount = 0;
    
    for (const review of reviews) {
      let needUpdate = false;
      const updateData = {};
      
      // Fix undefined/null values
      if (review.isHidden === undefined || review.isHidden === null) {
        updateData.isHidden = false;
        needUpdate = true;
      }
      
      if (review.isDeleted === undefined || review.isDeleted === null) {
        updateData.isDeleted = false;
        needUpdate = true;
      }
      
      if (review.isSpam === undefined || review.isSpam === null) {
        updateData.isSpam = false;
        needUpdate = true;
      }
      
      if (review.isOffensive === undefined || review.isOffensive === null) {
        updateData.isOffensive = false;
        needUpdate = true;
      }
      
      if (needUpdate) {
        await Review.findByIdAndUpdate(review._id, updateData);
        updatedCount++;
        console.log(`Updated review ${review._id}: ${JSON.stringify(updateData)}`);
      }
    }
    
    console.log(`Fixed ${updatedCount} reviews`);
    
    // Verify the stats after fix
    const totalReviews = await Review.countDocuments();
    const activeReviews = await Review.countDocuments({ 
      isHidden: false, 
      isDeleted: false 
    });
    const hiddenReviews = await Review.countDocuments({ 
      isDeleted: false, 
      isHidden: true 
    });
    const deletedReviews = await Review.countDocuments({ isDeleted: true });
    const spamReviews = await Review.countDocuments({ isSpam: true });
    const offensiveReviews = await Review.countDocuments({ isOffensive: true });
    
    console.log('After fix stats:', {
      totalReviews,
      activeReviews,
      hiddenReviews,
      deletedReviews,
      spamReviews,
      offensiveReviews
    });
    
    console.log('Review data fix completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing review data:', error);
    process.exit(1);
  }
}

fixReviewData();