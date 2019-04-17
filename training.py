# -*- coding: utf-8 -*-
"""
Spyder Editor

This is a temporary script file.
"""

# -*- coding: utf-8 -*-
"""
Spyder Editor

This is a temporary script file.
"""


import MySQLdb
import operator
import sys
from sklearn import model_selection, preprocessing, linear_model, naive_bayes, metrics, svm
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.feature_selection import SelectKBest
from sklearn.feature_selection import chi2,f_classif,mutual_info_classif
import numpy as np

import pandas as pd

def train_model(classifier, feature_vector_train, label, feature_vector_valid, is_neural_net=False):
    # fit the training dataset on the classifier
    classifier.fit(feature_vector_train, label)
    
    # predict the labels on validation dataset
    predictions = classifier.predict(feature_vector_valid)
    probs = classifier.predict_proba(feature_vector_valid)
    
    if is_neural_net:
        predictions = predictions.argmax(axis=-1)
    
    return probs, predictions

def get_best_features(tfidf_vect, xtrain_tfidf, labels):
        # Create and fit selector
    mi_selector = SelectKBest(mutual_info_classif, k=30)
    mi_selector.fit(xtrain_tfidf, labels)
    # Get columns to keep
    mi_scores = pd.DataFrame(list(zip(tfidf_vect.get_feature_names(), mi_selector.scores_)), 
                                     columns=['ftr', 'score'])

    kbest = np.asarray(tfidf_vect.get_feature_names())[mi_selector.get_support()]

    return kbest

def filter_best_features(k_best_features, abstracts_all, predictions):
    return_str = ""
    for afeature in k_best_features:
        rel_count = 0
        nrel_count = 0
        rel_total = 0
        nrel_total = 0
        for i, abstract in enumerate(abstracts_all):
            if predictions[i] == 0:
                rel_total += 1
                if afeature in abstract:
                    rel_count += 1 
            else:
                nrel_total +=1
                if afeature in abstract:
                    nrel_count += 1 
        if rel_total == 0:
            rel_total += 1
        if nrel_total == 0:
            nrel_total += 1
        if (rel_count/rel_total) > (nrel_count/nrel_total):
            return_str += afeature + " "

    return return_str
    

def train_main(task_id):
    db = MySQLdb.connect("localhost", "root", "", "test", charset='utf8')
    
    cursor = db.cursor()
    
    sql = "SELECT abstract, label FROM articles where taskid=" + str(task_id) + " and (label=1 or label=3)"
    abstracts = []
    labels = []
    try:
       cursor.execute(sql)
       results = cursor.fetchall()
       for row in results:
         abstracts.append(row[0])
         labels.append(row[1])
    except:
       print ("Error: unable to fecth data")
       
    # generate pseudo-labels when the user labeled very few articles
    if len(labels) < 20:
        sql_topK = "SELECT abstract, label FROM articles where taskid=" + str(task_id) + " order by artid DESC"
        try:
           cursor.execute(sql_topK)
           results_top = cursor.fetchall()
           count = 0
           for row in results_top:
               if count == 10:
                   break
               if row[0] not in abstracts:
                   abstracts.append(row[0])
                   labels.append(1)
                   count += 1
        except:
           print ("Error: unable to fecth data")
        
        sql_bottomK = "SELECT abstract, label FROM articles where taskid=" + str(task_id) + " order by artid ASC"
        try:
           cursor.execute(sql_bottomK)
           results_bottom = cursor.fetchall()
           count = 0
           for row in results_bottom:
               if count == 10:
                   break
               if row[0] not in abstracts:
                   abstracts.append(row[0])
                   labels.append(3)
                   count += 1
        except:
           print ("Error: unable to fecth data")
        
    sql2 = "SELECT abstract, artid FROM articles where taskid=" + str(task_id) 
    abstracts_all = []
    ids = []
    try:
        cursor.execute(sql2)
        results_all = cursor.fetchall()
        for arow in results_all:
            abstracts_all.append(arow[0])
            ids.append(arow[1])
    except:
       print ("Error: unable to fecth data")
    
    # label encode the target variable
    encoder = preprocessing.LabelEncoder()
    train_y = encoder.fit_transform(labels)
    
    # word level tf-idf
    #tfidf_vect = TfidfVectorizer(stop_words='english', analyzer='word', token_pattern=r'\w{1,}', max_features=1000)
    tfidf_vect = TfidfVectorizer(stop_words='english', analyzer='word', token_pattern=r'\b\w*[a-zA-Z]\w*\b', max_features=1000)
    tfidf_vect.fit(abstracts)
    xtrain_tfidf =  tfidf_vect.transform(abstracts)
    xvalid_tfidf =  tfidf_vect.transform(abstracts_all)


    # get features idf score and print top10
#    idf = tfidf_vect.idf_
#    feature_dict = dict(zip(tfidf_vect.get_feature_names(), idf))
#    sorted_feature_dict = sorted(feature_dict.items(), key=operator.itemgetter(1))
#    top10_features = ""
#    count = 0
#    for item in sorted_feature_dict: 
#        if count == 10:
#            break
#        top10_features += item[0]
#        top10_features += " "
#        count += 1

    # Naive Bayes on Word Level TF IDF Vectors
    probs, predictions = train_model(naive_bayes.MultinomialNB(), xtrain_tfidf, train_y, xvalid_tfidf)   
    
    # get top20 using sklearn feature selection
    k_best_features = get_best_features(tfidf_vect, xvalid_tfidf, predictions)
    return_str = filter_best_features(k_best_features, abstracts_all, predictions)
    print(return_str)
 
    pred_label = ["Related", "Non-related"]

    for i in range(0, len(ids)):        
        sql_insert = "insert into articles (taskid, artid) value (" + str(task_id) + "," + str(ids[i]) + ")  on duplicate key update score = " + str(probs[i][0]) + ", pred_label = '" + pred_label[predictions[i]] + "', uncert_score = " + str(1-max(probs[i][0],probs[i][1]))
        cursor.execute(sql_insert)
 
    db.commit()
    cursor.close()
    db.close()

if __name__ == '__main__':
    task_id = sys.argv[1]
    train_main(task_id)

