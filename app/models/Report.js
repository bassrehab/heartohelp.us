
module.exports = function(app, model) {
    
    var mongoose  = app.libs.mongoose;
    var bantime = 5 * 60 * 1000; // 5minutes time out


    var Report = new mongoose.Schema({
        userip      : { type: String, index: true }
      //, infractions : Number 
      , roomid      : String
      , permanent   : {type: Boolean, default: false, index: true}
      , lastdate    : { type: Date, default: Date.now }
      , unbandate   : Date
      , reportingip : { type: String, index: true }
      , reportedmsg : String
    },
    {safe: undefined});
    
    Report.pre('save', function(next) {
        this.unbandate = new Date(Date.now()+bantime);
        next();
    });
    
    var ReportModel = model.mongoose.model('Report', Report);
    return ReportModel;
}

